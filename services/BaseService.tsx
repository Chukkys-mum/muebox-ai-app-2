// services/BaseService.tsx

import createClient from '@/utils/supabase/client';
import type { Database } from '@/types/supabase';
import { 
  FileRow, 
  FileStatus, 
  FileCategory,
  FilePermissions,
  FileOperationResult,
  FileStorageUsage
} from "@/types/FileTypes";
import { getFileCategory } from "@/utils/FileUtils";
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

export class BaseService {
    protected supabase: SupabaseClient = createClient();

  protected async handleQuery<T>(
    query: Promise<{ data: T | null; error: any }>
  ): Promise<T> {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    if (!data) throw new Error('No data returned');
    return data;
  }

  protected handleError(err: unknown, operation: string): never {
    console.error(`${operation}:`, err);
    throw new Error(`Failed to ${operation}`);
  }

  protected transformPermissions(permissions: Record<string, boolean> | null): FilePermissions | undefined {
    if (!permissions) return undefined;
    return {
      read: permissions.read || false,
      write: permissions.write || false,
      delete: permissions.delete || false
    };
  }

  protected transformPermissionsToDb(permissions: FilePermissions | undefined): Record<string, boolean> | null {
    if (!permissions) return null;
    return {
      read: permissions.read,
      write: permissions.write,
      delete: permissions.delete
    };
  }

  protected transformDatabaseFile(file: Database['public']['Tables']['files']['Row']): FileRow {
    return {
      id: file.id,
      file_name: file.file_name,
      size: file.size,
      type: file.type,
      status: file.status as FileStatus,
      category: (file.category as FileCategory) || getFileCategory(file.extension || "") || "other",
      extension: file.extension,
      mime_type: file.mime_type ?? file.file_type ?? null,
      parent_id: file.parent_id,
      is_pinned: file.is_pinned ?? false,
      starred: file.starred ?? false,
      tags: file.tags ?? [],
      description: file.description ?? '',
      created_at: file.created_at,
      updated_at: file.updated_at,
      deleted_at: file.deleted_at,
      archived_at: file.archived_at,
      is_shared: file.is_shared ?? false,
      shared_with: file.shared_with ?? [],
      permissions: file.permissions,
      user_id: file.user_id,
      metadata: file.metadata ?? null,
      related_entity_type: file.related_entity_type,
      related_entity_id: file.related_entity_id,
      file_path: file.file_path,
      uploaded_by: file.uploaded_by
    };
  }

  protected transformToDatabase(file: Partial<FileRow>): Database['public']['Tables']['files']['Insert'] {
    return {
      file_name: file.file_name!,
      size: typeof file.size === 'string' ? parseInt(file.size) : (file.size || 0),
      type: file.type || 'file',
      status: file.status || 'active',
      category: file.category || 'other',
      extension: file.extension || null,
      mime_type: file.mime_type || null,
      parent_id: file.parent_id || null,
      is_pinned: file.is_pinned || false,
      starred: file.starred || false,
      tags: file.tags || null,
      description: file.description || null,
      is_shared: file.is_shared || false,
      shared_with: file.shared_with || null,
      permissions: file.permissions || null,
      user_id: file.user_id!,
      metadata: file.metadata || null,
      related_entity_type: file.related_entity_type || null,
      related_entity_id: file.related_entity_id || null,
      file_path: file.file_path || null,
      uploaded_by: file.uploaded_by!,
      deleted_at: file.deleted_at || null,
      archived_at: file.archived_at || null,
      file_type: file.mime_type || null
    };
  }

  protected async genericFileOperation(
    operation: () => Promise<PostgrestSingleResponse<Database['public']['Tables']['files']['Row']>>,
    successMessage: string
  ): Promise<FileOperationResult> {
    try {
      const { data, error } = await operation();
      if (error) throw error;
      return {
        success: true,
        message: successMessage,
        file: data ? this.transformDatabaseFile(data) : undefined
      };
    } catch (err) {
      console.error(`${successMessage} operation failed:`, err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Operation failed'
      };
    }
  }
  
  protected async genericBulkFileOperation(
    operation: () => Promise<PostgrestSingleResponse<Database['public']['Tables']['files']['Row'][]>>,
    successMessage: string
  ): Promise<FileOperationResult> {
    try {
      const { data, error } = await operation();
      if (error) throw error;
      return {
        success: true,
        message: successMessage,
        files: data ? data.map(file => this.transformDatabaseFile(file)) : undefined
      };
    } catch (err) {
      console.error(`${successMessage} operation failed:`, err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Operation failed'
      };
    }
  }

  protected async updateEntity(
    entityId: string,
    updates: Partial<FileRow>,
    entityType: 'file' | 'folder',
    successMessage: string
  ): Promise<FileOperationResult> {
    return this.genericFileOperation(
      async () => await this.supabase
        .from("files")
        .update(this.transformToDatabase(updates))
        .eq("id", entityId)
        .eq("type", entityType)
        .select()
        .single(),
      successMessage
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
        used: data.used_space,
        total: data.total_space,
        breakdown: data.storage_breakdown
      };
    } catch (err) {
      console.error("getStorageUsage:", err);
      return { used: 0, total: 0, breakdown: {} };
    }
  }

  async shareEntity(entityId: string, entityType: 'file' | 'folder'): Promise<FileOperationResult> {
    return this.updateEntity(
      entityId,
      { is_shared: true },
      entityType,
      `${entityType} shared successfully`
    );
  }
  
  async starEntity(entityId: string, entityType: 'file' | 'folder'): Promise<FileOperationResult> {
    return this.updateEntity(
      entityId,
      { starred: true },
      entityType,
      `${entityType} starred successfully`
    );
  }
  
  async renameEntity(entityId: string, newName: string, entityType: 'file' | 'folder'): Promise<FileOperationResult> {
    return this.updateEntity(
      entityId,
      { file_name: newName },
      entityType,
      `${entityType} renamed successfully`
    );
  }
  
  async reportEntity(entityId: string, entityType: 'file' | 'folder'): Promise<FileOperationResult> {
    return this.updateEntity(
      entityId,
      { 
        metadata: {
          reported: true,
          reported_at: new Date().toISOString()
        }
      },
      entityType,
      `${entityType} reported successfully`
    );
  }
  
  async getEntityDownloadLink(entityId: string, entityType: 'file' | 'folder'): Promise<string> {
    const { data } = await this.supabase
      .from("files")
      .select("file_path")
      .eq("id", entityId)
      .eq("type", entityType)
      .single();
      
    if (!data?.file_path) throw new Error(`${entityType} not found`);
    return data.file_path;
  }
}

