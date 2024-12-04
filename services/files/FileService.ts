// services/files/FileService.ts

import { BaseService } from '../BaseService';
import { 
  FileRow, 
  FileStatus, 
  FileCategory,
  FilePermissions,
  FileOperationResult,
  FileStorageUsage,
  FileSettings
} from "@/types";
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';

// Custom error class for FileService
export class FileServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'FileServiceError';
  }
}

export class FileService extends BaseService {
  async fetchFiles(): Promise<FileRow[]> {
    try {
      const { data, error } = await this.supabase
        .from('files')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      return (data?.map(file => this.transformDatabaseFile(file)) || []);
    } catch (err) {
      logger.error('Failed to fetch files', { error: err });
      return [];
    }
  }

  async getFileSettings(): Promise<FileSettings | null> {
    try {
      const { data, error } = await this.supabase
        .from("file_settings")
        .select("*")
        .single();
  
      if (error) throw error;
  
      if (!data) return null;
  
      return {
        id: data.id,
        maxFileSize: data.max_file_size,
        allowedFileTypes: data.allowed_file_types || [],
        updated_at: data.updated_at
      };
    } catch (err) {
      console.error('getFileSettings:', err);
      return null;
    }
  }

  async getArchivedFiles(page: number = 1, limit: number = 10): Promise<{ files: FileRow[], total: number }> {
    try {
      const start = (page - 1) * limit;
      const end = start + limit - 1;
  
      const { data, error, count } = await this.supabase
        .from('files')
        .select('*', { count: 'exact' })
        .eq('status', 'archived')
        .order('archived_at', { ascending: false })
        .range(start, end);
  
      if (error) throw error;
  
      return {
        files: data?.map(file => this.transformDatabaseFile(file)) || [],
        total: count || 0
      };
    } catch (err) {
      console.error('getArchivedFiles:', err);
      return { files: [], total: 0 };
    }
  }
  
  async getArchivedStorageUsage(): Promise<FileStorageUsage> {
    try {
      const { data, error } = await this.supabase.rpc('get_archived_storage_usage') as PostgrestSingleResponse<{
        used_space: number;
        total_space: number;
        storage_breakdown: Record<string, number>;
      }>;
  
      if (error) throw error;
  
      return {
        used: data?.used_space || 0,
        total: data?.total_space || 0,
        breakdown: data?.storage_breakdown || {}
      };
    } catch (err) {
      console.error("getArchivedStorageUsage:", err);
      return { used: 0, total: 0, breakdown: {} };
    }
  }
  
  async restoreFromArchive(fileId: string): Promise<FileOperationResult> {
    return this.genericFileOperation(
      async () => await this.supabase
        .from("files")
        .update({ 
          status: 'active' as FileStatus,
          archived_at: null
        })
        .eq("id", fileId)
        .select()
        .single(),
      'File restored successfully'
    );
  }

  async updateFileSettings(settings: Partial<FileSettings>): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("file_settings")
        .update({
          max_file_size: settings.maxFileSize,
          allowed_file_types: settings.allowedFileTypes,
          // Don't update id or updated_at, they should be handled by the database
        })
        .eq("id", settings.id);
  
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('updateFileSettings:', err);
      return false;
    }
  }

  async searchFiles(query: string): Promise<FileRow[]> {
    try {
      const { data, error } = await this.supabase
        .from("files")
        .select("*")
        .ilike("file_name", `%${query}%`);

      if (error) throw error;
      return (data?.map(file => this.transformDatabaseFile(file)) || []);
    } catch (err) {
      console.error('searchFiles:', err);
      return [];
    }
  }

  async deleteFile(fileId: string): Promise<FileOperationResult> {
    return this.genericFileOperation(
      async () => await this.supabase
        .from("files")
        .update({ 
          status: 'deleted' as FileStatus,
          deleted_at: new Date().toISOString()
        })
        .eq("id", fileId)
        .select()
        .single(),
      'File deleted successfully'
    );
  }

  async uploadFile(file: Partial<FileRow>): Promise<FileOperationResult> {
    return this.genericFileOperation(
      async () => await this.supabase
        .from('files')
        .insert([this.transformToDatabase(file)])
        .select()
        .single(),
      'File uploaded successfully'
    );
  }

  async updateFile(fileId: string, updates: Partial<FileRow>): Promise<FileOperationResult> {
    return this.genericFileOperation(
      async () => await this.supabase
        .from("files")
        .update(this.transformToDatabase(updates))
        .eq("id", fileId)
        .select()
        .single(),
      'File updated successfully'
    );
  }

  async getFilesByFolder(folderId: string): Promise<FileRow[]> {
    try {
      const { data, error } = await this.supabase
        .from("files")
        .select("*")
        .eq("parent_id", folderId)
        .eq("status", "active");

      if (error) throw error;
      return (data?.map(file => this.transformDatabaseFile(file)) || []);
    } catch (err) {
      console.error('getFilesByFolder:', err);
      return [];
    }
  }

  async getFilesByCategory(category: FileCategory): Promise<FileRow[]> {
    try {
      const { data, error } = await this.supabase
        .from("files")
        .select("*")
        .eq("category", category)
        .eq("status", "active");

      if (error) throw error;
      return (data?.map(file => this.transformDatabaseFile(file)) || []);
    } catch (err) {
      console.error('getFilesByCategory:', err);
      return [];
    }
  }

  async getFilesAndFolders(): Promise<FileRow[]> {
    try {
      const { data, error } = await this.supabase
        .from("files")
        .select("*")
        .is("parent_id", null)
        .eq("status", "active");

      if (error) throw error;
      return (data?.map(file => this.transformDatabaseFile(file)) || []);
    } catch (err) {
      console.error('getFilesAndFolders:', err);
      return [];
    }
  }

  async moveFile(fileId: string, newParentId: string | null): Promise<FileOperationResult> {
    return this.genericFileOperation(
      async () => await this.supabase
        .from("files")
        .update({ parent_id: newParentId })
        .eq("id", fileId)
        .select()
        .single(),
      'File moved successfully'
    );
  }

  async updateSharing(
    fileId: string, 
    isShared: boolean, 
    sharedWith?: string[] | null
  ): Promise<FileOperationResult> {
    return this.genericFileOperation(
      async () => await this.supabase
        .from("files")
        .update({ 
          is_shared: isShared,
          shared_with: sharedWith
        })
        .eq("id", fileId)
        .select()
        .single(),
      'Sharing settings updated successfully'
    );
  }

  async getStorageUsage(): Promise<FileStorageUsage> {
    try {
      const { data, error } = await this.supabase.rpc('get_storage_usage') as PostgrestSingleResponse<{
        used_space: number;
        total_space: number;
        storage_breakdown: Record<string, number>;
      }>;
  
      if (error) throw error;
  
      return {
        used: data?.used_space || 0,
        total: data?.total_space || 0,
        breakdown: data?.storage_breakdown || {}
      };
    } catch (err) {
      console.error("getStorageUsage:", err);
      return { used: 0, total: 0, breakdown: {} };
    }
  }

  // In FileService:

async shareFile(fileId: string): Promise<FileOperationResult> {
  return this.shareEntity(fileId, 'file');
}

async shareFolder(folderId: string): Promise<FileOperationResult> {
  return this.shareEntity(folderId, 'folder');
}

async starFile(fileId: string): Promise<FileOperationResult> {
  return this.starEntity(fileId, 'file');
}

async starFolder(folderId: string): Promise<FileOperationResult> {
  return this.starEntity(folderId, 'folder');
}

async renameFile(fileId: string, newName: string): Promise<FileOperationResult> {
  return this.renameEntity(fileId, newName, 'file');
}

async renameFolder(folderId: string, newName: string): Promise<FileOperationResult> {
  return this.renameEntity(folderId, newName, 'folder');
}

async reportFile(fileId: string): Promise<FileOperationResult> {
  return this.reportEntity(fileId, 'file');
}

async reportFolder(folderId: string): Promise<FileOperationResult> {
  return this.reportEntity(folderId, 'folder');
}

async getDownloadLink(fileId: string): Promise<string> {
  return this.getEntityDownloadLink(fileId, 'file');
}

async getFolderDownloadLink(folderId: string): Promise<string> {
  return this.getEntityDownloadLink(folderId, 'folder');
}

  
}

// Export the FileService class
export const fileService = new FileService();