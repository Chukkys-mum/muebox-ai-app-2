// services/time-machine/ArchiveService.ts

import { FileService } from '../files/FileService';
import { 
  FileOperationResult, 
  FileWithCategory, 
  ArchiveStorageUsage, 
  FileStatus, 
  FileCategory,
  FileRow,
  FileStorageUsage
} from "@/types/FileTypes";

type StorageUsageResponse = {
  used_space: number;
  total_space: number;
  storage_breakdown: {
    images: number;
    videos: number;
    documents: number;
    others: number;
  };
};

export class ArchiveService extends FileService {
  async getArchivedFiles(
    page: number = 1,
    limit: number = 10
  ): Promise<{ files: FileWithCategory[]; total: number }> {
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
        files: data ? data.map(this.transformDatabaseFile) : [],
        total: count || 0
      };
    } catch (err) {
      console.error('getArchivedFiles:', err);
      return { files: [], total: 0 };
    }
  }

  async archiveFile(fileId: string): Promise<FileOperationResult> {
    return this.genericFileOperation(
      () => this.supabase
        .from("files")
        .update({
          status: 'archived',
          archived_at: new Date().toISOString()
        })
        .eq("id", fileId)
        .select()
        .single(),
      'File archived successfully'
    );
  }

  async bulkArchiveFiles(fileIds: string[]): Promise<FileOperationResult> {
    return this.genericBulkFileOperation(
      () => this.supabase
        .from('files')
        .update({
          status: 'archived',
          archived_at: new Date().toISOString()
        })
        .in('id', fileIds)
        .select(),
      `${fileIds.length} files archived successfully`
    );
  }

  async restoreFile(fileId: string): Promise<FileOperationResult> {
    return this.genericFileOperation(
      () => this.supabase
        .from('files')
        .update({
          status: 'active',
          archived_at: null
        })
        .eq('id', fileId)
        .select()
        .single(),
      'File restored successfully'
    );
  }

  async bulkRestoreFiles(fileIds: string[]): Promise<FileOperationResult> {
    return this.genericBulkFileOperation(
      () => this.supabase
        .from('files')
        .update({
          status: 'active',
          archived_at: null
        })
        .in('id', fileIds)
        .select(),
      `${fileIds.length} files restored successfully`
    );
  }

  async removeFromArchive(fileId: string): Promise<FileOperationResult> {
    return this.genericFileOperation(
      () => this.supabase
        .from('files')
        .update({
          status: 'deleted',
          deleted_at: new Date().toISOString()
        })
        .eq('id', fileId)
        .eq('status', 'archived')
        .select()
        .single(),
      'File removed from archive successfully'
    );
  }

  async restoreFromArchive(fileId: string): Promise<FileOperationResult> {
    return this.genericFileOperation(
      () => this.supabase
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

  async getStorageUsage(): Promise<ArchiveStorageUsage> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_archive_storage_usage') as { data: StorageUsageResponse | null, error: any };
  
      if (error) throw error;
  
      const breakdown: Record<FileCategory, number> = {
        image: data?.storage_breakdown?.images || 0,
        video: data?.storage_breakdown?.videos || 0,
        audio: 0,
        document: data?.storage_breakdown?.documents || 0,
        code: 0,
        archive: 0,
        other: data?.storage_breakdown?.others || 0
      };
  
      return {
        used: data?.used_space || 0,
        total: data?.total_space || 0,
        breakdown
      };
    } catch (err) {
      console.error('getStorageUsage:', err);
      return {
        used: 0,
        total: 0,
        breakdown: {
          image: 0, video: 0, audio: 0, document: 0, code: 0, archive: 0, other: 0
        }
      };
    }
  }

  async searchArchivedFiles(query: string): Promise<FileWithCategory[]> {
    try {
      // Search both filename and metadata fields
      const { data, error } = await this.supabase
        .from('files')
        .select('*')
        .eq('status', 'archived')
        .or(`file_name.ilike.%${query}%, description.ilike.%${query}%, tags.cs.{${query}}`);

      if (error) throw error;

      return data ? data.map(this.transformDatabaseFile) : [];
    } catch (err) {
      console.error('searchArchivedFiles:', err);
      return [];
    }
  }

  async updateArchivedFileMetadata(
    fileId: string,
    metadata: Partial<Pick<FileRow, "tags" | "description">>
  ): Promise<FileOperationResult> {
    return this.genericFileOperation(
      () => this.supabase
        .from('files')
        .update({
          ...metadata,
          updated_at: new Date().toISOString(),
          metadata: {
            last_modified_by: 'system',
            modified_at: new Date().toISOString(),
            ...metadata
          }
        })
        .eq('id', fileId)
        .eq('status', 'archived')
        .select()
        .single(),
      'File metadata updated successfully'
    );
  }

  async bulkRemoveFromArchive(fileIds: string[]): Promise<FileOperationResult> {
    return this.genericBulkFileOperation(
      () => this.supabase
        .from('files')
        .update({
          status: 'deleted',
          deleted_at: new Date().toISOString()
        })
        .in('id', fileIds)
        .eq('status', 'archived')
        .select(),
      `${fileIds.length} files removed from archive successfully`
    );
  }
}

export default new ArchiveService();