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


export interface KnowledgeBaseFile extends FileRow {
  knowledgeBaseType: 'public' | 'private';
  safeguardRules?: SafeguardFolder['safeguardRules'];
}

export interface KnowledgeBaseCreateInput {
  file_name: string;
  size: number;
  knowledgeBaseType: 'public' | 'private';
  safeguardRules?: SafeguardFolder['safeguardRules'];
  // Add other necessary properties
}

export interface KnowledgeBaseUpdateInput {
  file_name?: string;
  knowledgeBaseType?: 'public' | 'private';
  safeguardRules?: SafeguardFolder['safeguardRules'];
  metadata?: Record<string, any>;
  // Add other updatable properties
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
    [key: string]: any;  // This allows for additional properties
  }): FileRow {
    return {
      ...file,
      status: file.status as FileStatus,
      category: file.category as FileCategory | null,
      related_entity_type: file.related_entity_type || null,
      related_entity_id: file.related_entity_id || null,
      file_path: file.file_path || null,
      is_pinned: file.is_pinned || null,
      starred: file.starred || null,
      tags: file.tags || null,
      description: file.description || null,
      created_at: file.created_at || new Date().toISOString(),
      updated_at: file.updated_at || new Date().toISOString(),
      deleted_at: file.deleted_at || null,
      archived_at: file.archived_at || null,
      is_shared: file.is_shared || null,
      shared_with: file.shared_with || null,
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
      return data ? this.transformToKnowledgeBaseFile(data) : null;
    } catch (err) {
      console.error('getKnowledgeBaseById:', err);
      return null;
    }
  }

  getStorageUsage = cache(async (): Promise<FileStorageUsage> => {
    try {
      const { data, error } = await this.supabase.rpc('get_knowledge_base_storage') as PostgrestSingleResponse<{
        used: number;
        total: number;
      }>;

      if (error) throw error;

      return {
        used: data.used,
        total: data.total,
        breakdown: {} // Add an empty breakdown object to match FileStorageUsage type
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
      return data ? data.map(file => this.transformToKnowledgeBaseFile(file)) : [];
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
    return this.genericFileOperation(
      async () => await this.supabase
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
    
    return this.genericFileOperation(
      async () => await this.supabase
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
    return this.genericFileOperation(
      async () => await this.supabase
        .from('files')
        .update({ metadata: { safeguardRules: rules } })
        .eq('id', id)
        .select()
        .single(),
      'Safeguard rules updated successfully'
    );
  }

  async addFile(file: Omit<FileRow, "created_at" | "updated_at">): Promise<FileOperationResult> {
    return this.genericFileOperation(
      async () => await this.supabase.from("files").insert([file]).select().single(),
      'File added to Knowledge Base successfully'
    );
  }

  async removeFile(fileId: string): Promise<FileOperationResult> {
    return this.genericFileOperation(
      async () => await this.supabase.from("files").delete().eq("id", fileId).select().single(),
      'File removed from Knowledge Base successfully'
    );
  }
  
  searchFiles = cache(async (query: string): Promise<KnowledgeBaseFile[]> => {
    try {
      const { data, error } = await this.supabase
        .from("files")
        .select("*")
        .eq('type', 'knowledge_base')
        .ilike("file_name", `%${query}%`);
  
      if (error) throw error;
      return data ? data.map(file => this.transformToKnowledgeBaseFile(file)) : [];
    } catch (err) {
      console.error('searchFiles:', err);
      return [];
    }
  });
  
  getFilesByCategory = cache(async (category: FileCategory): Promise<KnowledgeBaseFile[]> => {
    try {
      const { data, error } = await this.supabase
        .from("files")
        .select("*")
        .eq("type", "knowledge_base")
        .eq("category", category);
  
      if (error) throw error;
      return data ? data.map(file => this.transformToKnowledgeBaseFile(file)) : [];
    } catch (err) {
      console.error('getFilesByCategory:', err);
      return [];
    }
  });

  async updateFile(fileId: string, updates: Partial<FileRow>): Promise<FileOperationResult> {
    return this.genericFileOperation(
      async () => await this.supabase.from("files").update(updates).eq("id", fileId).select().single(),
      'File updated in Knowledge Base successfully'
    );
  }

  // Archive functionality
  async archiveKnowledgeBaseFile(fileId: string): Promise<FileOperationResult> {
    const result = await this.archiveService.archiveFile(fileId);
    if (result.success) {
      await this.supabase
        .from("files")
        .update({ status: 'archived' as FileStatus })
        .eq("id", fileId);
    }
    return result;
  }

  async restoreKnowledgeBaseFile(fileId: string): Promise<FileOperationResult> {
    const result = await this.archiveService.restoreFile(fileId);
    if (result.success) {
      await this.supabase
        .from("files")
        .update({ status: 'active' as FileStatus })
        .eq("id", fileId);
    }
    return result;
  }

  async bulkArchiveKnowledgeBaseFiles(fileIds: string[]): Promise<FileOperationResult> {
    const result = await this.archiveService.bulkArchiveFiles(fileIds);
    if (result.success) {
      await this.supabase
        .from("files")
        .update({ status: 'archived' as FileStatus })
        .in("id", fileIds);
    }
    return result;
  }

  async bulkRestoreKnowledgeBaseFiles(fileIds: string[]): Promise<FileOperationResult> {
    const result = await this.archiveService.bulkRestoreFiles(fileIds);
    if (result.success) {
      await this.supabase
        .from("files")
        .update({ status: 'active' as FileStatus })
        .in("id", fileIds);
    }
    return result;
  }

  getArchivedKnowledgeBaseFiles = cache(async (page: number = 1, limit: number = 10): Promise<{ files: KnowledgeBaseFile[]; total: number }> => {
    try {
      const start = (page - 1) * limit;
      const end = start + limit - 1;
  
      const { data, error, count } = await this.supabase
        .from("files")
        .select('*', { count: 'exact' })
        .eq('status', 'archived')
        .eq('type', 'knowledge_base')
        .order('archived_at', { ascending: false })
        .range(start, end);
  
      if (error) throw error;
  
      return {
        files: data ? data.map(file => this.transformToKnowledgeBaseFile(file)) : [],
        total: count || 0
      };
    } catch (err) {
      console.error('getArchivedKnowledgeBaseFiles:', err);
      return { files: [], total: 0 };
    }
  });
}