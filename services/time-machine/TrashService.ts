// /services/time-machine/TrashService.ts

import { supabase } from "@/utils/supabase/client";
import { FileRow, FileStatus, FileCategory, CompatibleFileRow } from "@/types/FileTypes";
import { Database } from '@/types/types_db';
import { BaseService } from '../BaseService';

type TrashRow = Database['public']['Tables']['files']['Row'];
type StorageUsage = {
  used_space: number;
  total_space: number;
  storage_breakdown: Record<string, number>;
};

interface TrashedFile {
  id: string;
  name: string;
  size: number;
  deletedAt: string;
  tags: string[] | null;
  description: string | null;
}

function isValidFileStatus(status: string): status is FileStatus {
  return ['active', 'archived', 'deleted', 'trashed'].includes(status);
}

function isValidFileCategory(category: string | null): category is FileCategory | null {
  return category === null || ['image', 'video', 'audio', 'document', 'code', 'archive', 'other'].includes(category);
}

class TrashService extends BaseService {
  async getTrashedFiles(
    page: number = 1,
    limit: number = 10
  ): Promise<{ files: FileRow[]; total: number }> {
    try {
      const start = (page - 1) * limit;
      const end = start + limit - 1;
      
      const { data, error, count } = await this.supabase
        .from("files")
        .select("*", { count: "exact" })
        .eq("status", "trashed")
        .order("deleted_at", { ascending: false })
        .range(start, end);
      
      if (error) throw error;
      
      const files = (data || []).map((row: TrashRow): FileRow => {
        const metadata = row.metadata as Record<string, any> | null;
        const compatibleRow: CompatibleFileRow = {
          ...row,
          type: row.type || 'file',
          status: isValidFileStatus(row.status) ? row.status : 'trashed',
          category: isValidFileCategory(row.category) ? row.category : null,
          extension: row.extension || null,
          mime_type: row.mime_type || row.file_type || null,
          is_pinned: false,
          starred: false,
          tags: metadata?.tags || [],
          description: metadata?.description || '',
          is_shared: false,
          shared_with: [],
          permissions: null,
          user_id: row.uploaded_by,
        };
        return this.transformDatabaseFile(compatibleRow);
      });
      
      return { files, total: count || 0 };
    } catch (err) {
      console.error(err);
      return { files: [], total: 0 };
    }
  }

  async getStorageUsage(): Promise<{ 
    used: number; 
    total: number; 
    breakdown: Record<string, number>; 
  }> {
    try {
      const { data, error } = await this.supabase.rpc("get_storage_usage") as { data: StorageUsage, error: any };

      if (error) throw error;

      return {
        used: data.used_space,
        total: data.total_space,
        breakdown: data.storage_breakdown
      };
    } catch (err) {
      console.error(err);
      return {
        used: 0,
        total: 0,
        breakdown: {
          images: 0,
          videos: 0,
          documents: 0,
          others: 0
        }
      };
    }
  }

  async restoreFile(fileId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("files")
        .update({ status: 'active', deleted_at: null })
        .eq("id", fileId);

      if (error) {
        throw new Error(`Error restoring file: ${error.message}`);
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async bulkRestoreFiles(fileIds: string[]): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("files")
        .update({ status: 'active', deleted_at: null })
        .in("id", fileIds);

      if (error) {
        throw new Error(`Error restoring files: ${error.message}`);
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("files")
        .delete()
        .eq("id", fileId)
        .eq("status", "trashed");

      if (error) {
        throw new Error(`Error deleting file permanently: ${error.message}`);
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async bulkDeleteFiles(fileIds: string[]): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("files")
        .delete()
        .in("id", fileIds)
        .eq("status", "trashed");

      if (error) {
        throw new Error(`Error deleting files permanently: ${error.message}`);
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async searchTrashedFiles(query: string): Promise<FileRow[]> {
    try {
      const { data, error } = await this.supabase
        .from("files")
        .select("*")
        .eq("status", "trashed")
        .ilike("file_name", `%${query}%`);
  
      if (error) {
        throw new Error(`Error searching trashed files: ${error.message}`);
      }
  
      const files = (data || []).map((row: TrashRow): FileRow => {
        const metadata = row.metadata as Record<string, any> | null;
        const compatibleRow: CompatibleFileRow = {
          ...row,
          type: row.type || 'file',
          status: isValidFileStatus(row.status) ? row.status : 'trashed',
          category: isValidFileCategory(row.category) ? row.category : null,
          extension: row.extension || null,
          mime_type: row.mime_type || row.file_type || null,
          is_pinned: false,
          starred: false,
          tags: metadata?.tags || [],
          description: metadata?.description || '',
          is_shared: false,
          shared_with: [],
          permissions: null,
          user_id: row.uploaded_by,
        };
        return this.transformDatabaseFile(compatibleRow);
      });
  
      return files;
    } catch (err) {
      console.error('Error searching trashed files:', err);
      return [];
    }
  }

  async updateTrashedFileMetadata(
    fileId: string,
    metadata: Partial<Pick<TrashedFile, "tags" | "description">>
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("files")
        .update({
          tags: metadata.tags,
          description: metadata.description
        })
        .eq("id", fileId)
        .eq("status", "trashed");

      if (error) {
        throw new Error(`Error updating file metadata: ${error.message}`);
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}

export default new TrashService();