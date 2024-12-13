// services/files/KnowledgeBaseService.ts

import { FileService } from './FileService';
import { 
  FileOperationResult, 
  FileStorageUsage, 
  SafeguardFolder,
  FileRow,
  FileCategory,
  FileStatus
} from '@/types';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { archiveService } from '../time-machine/ArchiveService';
import { IArchiveService } from '../time-machine/types';
import { cache } from 'react';
import { Database } from '@/types/supabase';

type FileType = 'file' | 'folder' | 'knowledge_base';

type StorageRPCResponse = {
  used: number;
  total: number;
  breakdown?: Record<string, number>;
};

export interface KnowledgeBaseFile extends FileRow {
  knowledgeBaseType: 'public' | 'private';
  safeguardRules?: SafeguardFolder['safeguardRules'];
}

export interface KnowledgeBaseCreateInput {
  file_name: string;
  size: number;
  knowledgeBaseType: 'public' | 'private';
  safeguardRules?: SafeguardFolder['safeguardRules'];
  user_id: string;
  uploaded_by: string;
}

export interface KnowledgeBaseUpdateInput {
  file_name?: string;
  knowledgeBaseType?: 'public' | 'private';
  safeguardRules?: SafeguardFolder['safeguardRules'];
  metadata?: Record<string, any>;
}


export class KnowledgeBaseService extends FileService {
  private archiveService: IArchiveService;

  constructor() {
    super();
    this.archiveService = archiveService;
  }

  protected transformDatabaseFile(file: {
    id: string;
    file_name: string;
    size: number;
    type: "file" | "folder" | "knowledge_base";
    status: string;
    category: string | null;
    extension: string | null;
    mime_type: string | null;
    parent_id: string | null;
    uploaded_by: string;
    related_entity_type?: string | null;
    related_entity_id?: string | null;
    file_path?: string | null;
    is_pinned?: boolean | null;
    starred?: boolean | null;
    tags?: string[] | null;
    description?: string | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    archived_at?: string | null;
    is_shared?: boolean | null;
    shared_with?: string[] | null;
    permissions?: Record<string, boolean> | null;
    user_id?: string;
    metadata?: Record<string, any> | null;
  }): FileRow {
    return {
      ...file,
      status: file.status as FileStatus,
      category: file.category as FileCategory | null,
      related_entity_type: file.related_entity_type || null,
      related_entity_id: file.related_entity_id || null,
      file_path: file.file_path || null,
      is_pinned: file.is_pinned || false,
      starred: file.starred || false,
      tags: file.tags || [],
      description: file.description || '',
      created_at: file.created_at || new Date().toISOString(),
      updated_at: file.updated_at || new Date().toISOString(),
      deleted_at: file.deleted_at || null,
      archived_at: file.archived_at || null,
      is_shared: file.is_shared || false,
      shared_with: file.shared_with || [],
      permissions: file.permissions || null,
      user_id: file.user_id || '',
      metadata: {
        ...file.metadata,
        knowledgeBaseType: file.metadata?.knowledgeBaseType as 'public' | 'private' || "public",
        safeguardRules: file.metadata?.safeguardRules,
      },
    };
  }

  protected transformToKnowledgeBaseFile(file: FileRow): KnowledgeBaseFile {
    return {
      ...file,
      knowledgeBaseType: file.metadata?.knowledgeBaseType as 'public' | 'private' || 'public',
      safeguardRules: file.metadata?.safeguardRules,
    };
  }
  
  async getKnowledgeBaseById(id: string): Promise<KnowledgeBaseFile | null> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('id', id)
        .eq('type', 'knowledge_base')
        .single();
  
      if (error) throw error;
      if (!data) return null;
      
      return this.transformToKnowledgeBaseFile(this.transformDatabaseFile(data));
    } catch (err) {
      console.error('getKnowledgeBaseById:', err);
      return null;
    }
  }

  getStorageUsage = cache(async (): Promise<FileStorageUsage> => {
    try {
      const supabase = await this.getClient();
      // Change the RPC function and parameters to match what's available
      const { data, error } = await supabase.rpc('get_archive_storage_usage') as PostgrestSingleResponse<{
        used_space: number;
        total_space: number;
        storage_breakdown: Record<string, number>;
      }>;

      if (error) throw error;

      return {
        used: data.used_space,
        total: data.total_space,
        breakdown: data.storage_breakdown || {}
      };
    } catch (err) {
      console.error("getKnowledgeBaseStorageUsage:", err);
      return { used: 0, total: 0, breakdown: {} };
    }
  });

  async getAvailableKnowledgeBases(userId: string): Promise<KnowledgeBaseFile[]> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('type', 'knowledge_base')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;
      return data ? data.map(file => this.transformToKnowledgeBaseFile(this.transformDatabaseFile(file))) : [];
    } catch (err) {
      console.error('getAvailableKnowledgeBases:', err);
      return [];
    }
  }

  async createKnowledgeBase(knowledgeBase: KnowledgeBaseCreateInput): Promise<FileOperationResult> {
    const fileRowData: Partial<FileRow> = {
      file_name: knowledgeBase.file_name,
      size: knowledgeBase.size,
      type: 'knowledge_base',
      metadata: {
        knowledgeBaseType: knowledgeBase.knowledgeBaseType,
        safeguardRules: knowledgeBase.safeguardRules,
      },
    };

    const supabase = await this.getClient();
    return this.genericFileOperation(
      async () => await supabase
        .from('files')
        .insert([this.transformToDatabase(fileRowData)])
        .select()
        .single(),
      'Knowledge base created successfully'
    );
  }
  
  async updateKnowledgeBase(id: string, updates: KnowledgeBaseUpdateInput): Promise<FileOperationResult> {
    const fileRowUpdates: Partial<FileRow> = {
      file_name: updates.file_name,
      metadata: {
        ...(updates.metadata || {}),
        knowledgeBaseType: updates.knowledgeBaseType,
        safeguardRules: updates.safeguardRules,
      },
    };
    
    const supabase = await this.getClient();
    return this.genericFileOperation(
      async () => await supabase
        .from('files')
        .update(this.transformToDatabase(fileRowUpdates))
        .eq('id', id)
        .select()
        .single(),
      'Knowledge base updated successfully'
    );
  }

  async deleteKnowledgeBase(id: string): Promise<FileOperationResult> {
    return this.deleteFile(id);
  }

  async updateSafeguardRules(id: string, rules: SafeguardFolder['safeguardRules']): Promise<FileOperationResult> {
    const supabase = await this.getClient();
    return this.genericFileOperation(
      async () => await supabase
        .from('files')
        .update({ 
          metadata: { 
            safeguardRules: rules 
          } 
        })
        .eq('id', id)
        .select()
        .single(),
      'Safeguard rules updated successfully'
    );
  }

  async addFile(fileData: Omit<FileRow, "created_at" | "updated_at">): Promise<FileOperationResult> {
    const supabase = await this.getClient();
    
    // Transform the file data to match the expected database schema
    const dbFileData = {
      file_name: fileData.file_name,
      size: fileData.size,
      type: 'file' as const, // Use const assertion
      status: fileData.status,
      category: fileData.category,
      extension: fileData.extension,
      mime_type: fileData.mime_type,
      parent_id: fileData.parent_id,
      uploaded_by: fileData.uploaded_by,
      user_id: fileData.user_id,
      metadata: {
        ...fileData.metadata,
        originalType: 'knowledge_base' as const
      }
    };

    return this.genericFileOperation(
      async () => await supabase
        .from("files")
        .insert([dbFileData])
        .select()
        .single(),
      'File added to Knowledge Base successfully'
    );
  }

  async removeFile(fileId: string): Promise<FileOperationResult> {
    const supabase = await this.getClient();
    return this.genericFileOperation(
      async () => await supabase
        .from("files")
        .delete()
        .eq("id", fileId)
        .select()
        .single(),
      'File removed from Knowledge Base successfully'
    );
  }
  
  searchFiles = cache(async (query: string): Promise<KnowledgeBaseFile[]> => {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq('type', 'knowledge_base')
        .ilike("file_name", `%${query}%`);
  
      if (error) throw error;
      return data ? data.map(file => this.transformToKnowledgeBaseFile(this.transformDatabaseFile(file))) : [];
    } catch (err) {
      console.error('searchFiles:', err);
      return [];
    }
  });
  
  getFilesByCategory = cache(async (category: FileCategory): Promise<KnowledgeBaseFile[]> => {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("type", "knowledge_base")
        .eq("category", category);
  
      if (error) throw error;
      return data ? data.map(file => 
        this.transformToKnowledgeBaseFile(this.transformDatabaseFile(file))
      ) : [];
    } catch (err) {
      console.error('getFilesByCategory:', err);
      return [];
    }
  });

  async updateFile(fileId: string, updates: Partial<FileRow>): Promise<FileOperationResult> {
    const supabase = await this.getClient();
    
    // Transform updates to match database schema
    const dbUpdates: Partial<FileRow> = {
      ...updates,
      type: 'file' as FileType, // Use the FileType type
      metadata: {
        ...updates.metadata,
        originalType: 'knowledge_base' as const
      }
    };

    return this.genericFileOperation(
      async () => await supabase
        .from("files")
        .update(this.transformToDatabase(dbUpdates))
        .eq("id", fileId)
        .select()
        .single(),
      'File updated in Knowledge Base successfully'
    );
  }

  // Archive functionality
  async archiveKnowledgeBaseFile(fileId: string): Promise<FileOperationResult> {
    const result = await this.archiveService.archiveFile(fileId);
    if (result.success) {
      const supabase = await this.getClient();
      await supabase
        .from("files")
        .update({ 
          status: 'archived' as FileStatus,
          archived_at: new Date().toISOString()
        })
        .eq("id", fileId);
    }
    return result;
  }

  async restoreKnowledgeBaseFile(fileId: string): Promise<FileOperationResult> {
    const result = await this.archiveService.restoreFile(fileId);
    if (result.success) {
      const supabase = await this.getClient();
      await supabase
        .from("files")
        .update({ 
          status: 'active' as FileStatus,
          archived_at: null 
        })
        .eq("id", fileId);
    }
    return result;
  }

  async bulkArchiveKnowledgeBaseFiles(fileIds: string[]): Promise<FileOperationResult> {
    const result = await this.archiveService.bulkArchiveFiles(fileIds);
    if (result.success) {
      const supabase = await this.getClient();
      await supabase
        .from("files")
        .update({ 
          status: 'archived' as FileStatus,
          archived_at: new Date().toISOString()
        })
        .in("id", fileIds);
    }
    return result;
  }

  async bulkRestoreKnowledgeBaseFiles(fileIds: string[]): Promise<FileOperationResult> {
    const result = await this.archiveService.bulkRestoreFiles(fileIds);
    if (result.success) {
      const supabase = await this.getClient();
      await supabase
        .from("files")
        .update({ 
          status: 'active' as FileStatus,
          archived_at: null 
        })
        .in("id", fileIds);
    }
    return result;
  }

  getArchivedKnowledgeBaseFiles = cache(async (page: number = 1, limit: number = 10): Promise<{ 
    files: KnowledgeBaseFile[]; 
    total: number 
  }> => {
    try {
      const start = (page - 1) * limit;
      const end = start + limit - 1;
      
      const supabase = await this.getClient();
      const { data, error, count } = await supabase
        .from("files")
        .select('*', { count: 'exact' })
        .eq('type', 'knowledge_base')
        .eq('status', 'archived')
        .order('archived_at', { ascending: false })
        .range(start, end);
  
      if (error) throw error;
  
      return {
        files: data ? data.map(file => 
          this.transformToKnowledgeBaseFile(this.transformDatabaseFile(file))
        ) : [],
        total: count || 0
      };
    } catch (err) {
      console.error('getArchivedKnowledgeBaseFiles:', err);
      return { files: [], total: 0 };
    }
  });
}