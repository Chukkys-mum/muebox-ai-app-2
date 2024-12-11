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
  async fetchFiles(userId: string): Promise<FileRow[]> {
    try {
      const { data, error } = await this.supabase
        .from('files')
        .select('*')
        .eq('status', 'active')
        .eq('user_id', userId); // Add this filter

      if (error) throw error;
      return (data?.map(file => this.transformDatabaseFile(file)) || []);
    } catch (err) {
      logger.error('Failed to fetch files', { error: err });
      return [];
    }
}

  async getAvailableFolders(userId: string): Promise<FileRow[]> {
    try {
      const { data, error } = await this.supabase
        .from('files')
        .select('*')
        .eq('type', 'folder')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;
      return data ? data.map(folder => this.transformDatabaseFile(folder)) : [];
    } catch (err) {
      console.error('getAvailableFolders:', err);
      return [];
    }
  }

  async fetchFolders(userId: string): Promise<FileRow[]> {
    try {
      const { data, error } = await this.supabase
        .from('files')
        .select('*')
        .eq('type', 'folder')
        .eq('status', 'active')
        .eq('user_id', userId); // Add this filter

      if (error) throw error;
      return data?.map(folder => this.transformDatabaseFile(folder)) || [];
    } catch (err) {
      logger.error('Failed to fetch folders', { error: err });
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

  static async getFilesByFolder(folderId: string): Promise<FileRow[]> {
    const service = new FileService();
    return service.getFilesByFolder(folderId);
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

  static async getFilesAndFolders(): Promise<FileRow[]> {
    const service = new FileService();
    return service.getFilesAndFolders();
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

  // Add these methods to FileService class

  async copyFile(fileId: string, destinationFolderId: string | null): Promise<FileOperationResult> {
    try {
      // First, get the original file
      const { data: originalFile, error: fetchError } = await this.supabase
        .from("files")
        .select("*")
        .eq("id", fileId)
        .single();

      if (fetchError) throw fetchError;
      if (!originalFile) throw new Error('Original file not found');

      // Create a copy of the file with new destination
      const newFile = {
        ...originalFile,
        id: undefined, // Let the database generate a new ID
        parent_id: destinationFolderId,
        file_name: `Copy of ${originalFile.file_name}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // If it's a file (not a folder), handle file content copying
      if (originalFile.type === 'file' && originalFile.file_path) {
        const newPath = `${destinationFolderId || 'root'}/${newFile.file_name}`;
        
        // Copy the actual file in storage
        const { error: storageError } = await this.supabase
          .storage
          .from('files')
          .copy(originalFile.file_path, newPath);

        if (storageError) throw storageError;
        newFile.file_path = newPath;
      }

      // Insert the new file record
      return this.genericFileOperation(
        async () => await this.supabase
          .from("files")
          .insert([newFile])
          .select()
          .single(),
        'File copied successfully'
      );
    } catch (err) {
      console.error('copyFile:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to copy file'
      };
    }
  }

  async editFile(fileId: string, updates: {
    content?: string;
    metadata?: Record<string, any>;
  }): Promise<FileOperationResult> {
    try {
      // Get the current file first
      const { data: currentFile, error: fetchError } = await this.supabase
        .from("files")
        .select("*")
        .eq("id", fileId)
        .single();

      if (fetchError) throw fetchError;
      if (!currentFile) throw new Error('File not found');

      // Prepare updates
      const fileUpdates: Partial<FileRow> = {
        updated_at: new Date().toISOString(),
        metadata: {
          ...currentFile.metadata,
          ...updates.metadata,
          last_edited: new Date().toISOString()
        }
      };

      // If content is being updated and there's a file path
      if (updates.content && currentFile.file_path) {
        // Update the file content in storage
        const { error: storageError } = await this.supabase
          .storage
          .from('files')
          .update(
            currentFile.file_path,
            new Blob([updates.content], { type: currentFile.mime_type || 'text/plain' }),
            {
              cacheControl: '3600',
              upsert: true
            }
          );

        if (storageError) throw storageError;
      }

      // Update the file record
      return this.genericFileOperation(
        async () => await this.supabase
          .from("files")
          .update(this.transformToDatabase(fileUpdates))
          .eq("id", fileId)
          .select()
          .single(),
        'File updated successfully'
      );
    } catch (err) {
      console.error('editFile:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to edit file'
      };
    }
  }

  async createCopy(fileId: string, newName?: string): Promise<FileOperationResult> {
    try {
      // Get the original file
      const { data: originalFile, error: fetchError } = await this.supabase
        .from("files")
        .select("*")
        .eq("id", fileId)
        .single();

      if (fetchError) throw fetchError;
      if (!originalFile) throw new Error('Original file not found');

      // Create a copy in the same folder
      return await this.copyFile(fileId, originalFile.parent_id);
    } catch (err) {
      console.error('createCopy:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create copy'
      };
    }
  }

  async saveToDraft(fileId: string): Promise<FileOperationResult> {
    return this.genericFileOperation(
      async () => await this.supabase
        .from("files")
        .update({ 
          status: 'draft' as FileStatus,
          metadata: {
            draft_saved_at: new Date().toISOString()
          }
        })
        .eq("id", fileId)
        .select()
        .single(),
      'File saved to drafts'
    );
  }

  async getFileContent(fileId: string): Promise<string | null> {
    try {
      const { data: file, error: fetchError } = await this.supabase
        .from("files")
        .select("file_path")
        .eq("id", fileId)
        .single();

      if (fetchError) throw fetchError;
      if (!file?.file_path) return null;

      const { data, error: downloadError } = await this.supabase
        .storage
        .from('files')
        .download(file.file_path);

      if (downloadError) throw downloadError;

      return await data.text();
    } catch (err) {
      console.error('getFileContent:', err);
      return null;
    }
  }

  async saveFileContent(fileId: string, content: string): Promise<FileOperationResult> {
    try {
      const { data: file, error: fetchError } = await this.supabase
        .from("files")
        .select("file_path, mime_type")
        .eq("id", fileId)
        .single();

      if (fetchError) throw fetchError;
      if (!file?.file_path) throw new Error('File path not found');

      // Upload the new content
      const { error: uploadError } = await this.supabase
        .storage
        .from('files')
        .update(
          file.file_path,
          new Blob([content], { type: file.mime_type || 'text/plain' }),
          {
            cacheControl: '3600',
            upsert: true
          }
        );

      if (uploadError) throw uploadError;

      // Update the file record
      return await this.updateFile(fileId, {
        metadata: {
          last_modified: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error('saveFileContent:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to save file content'
      };
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