// services/files/KnowledgeBaseService.ts

import { FileService } from './FileService';
import { 
  KnowledgeBaseFile, 
  FileOperationResult, 
  FileStorageUsage, 
  SafeguardFolder,
  FileRow,
  FileCategory
} from '@/types';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import ArchiveService, { ArchiveService as ArchiveServiceClass } from '../time-machine/ArchiveService';

export class KnowledgeBaseService extends FileService {
  private archiveService: ArchiveServiceClass;

  constructor() {
    super();
    this.archiveService = ArchiveService;
  }


  async getKnowledgeBases(): Promise<KnowledgeBaseFile[]> {
    try {
      const { data, error } = await this.supabase
        .from('files')
        .select('*')
        .eq('type', 'knowledge_base')
        .eq('status', 'active');

      if (error) throw error;
      return data?.map(kb => this.transformDatabaseFile(kb) as KnowledgeBaseFile) || [];
    } catch (err) {
      console.error('getKnowledgeBases:', err);
      return [];
    }
  }

  async getStorageUsage(): Promise<FileStorageUsage> {
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
  }

  async createKnowledgeBase(knowledgeBase: Partial<KnowledgeBaseFile>): Promise<FileOperationResult> {
    return this.genericFileOperation(
      async () => await this.supabase
        .from('files')
        .insert([this.transformToDatabase(knowledgeBase)])
        .select()
        .single(),
      'Knowledge base created successfully'
    );
  }

  async updateKnowledgeBase(id: string, updates: Partial<KnowledgeBaseFile>): Promise<FileOperationResult> {
    return this.genericFileOperation(
      async () => await this.supabase
        .from('files')
        .update(this.transformToDatabase(updates))
        .eq('id', id)
        .select()
        .single(),
      'Knowledge base updated successfully'
    );
  }

  async deleteKnowledgeBase(id: string): Promise<FileOperationResult> {
    return this.deleteFile(id);
  }

  async getKnowledgeBaseById(id: string): Promise<KnowledgeBaseFile | null> {
    try {
      const { data, error } = await this.supabase
        .from('files')
        .select('*')
        .eq('id', id)
        .eq('type', 'knowledge_base')
        .single();

      if (error) throw error;
      return data ? this.transformDatabaseFile(data) as KnowledgeBaseFile : null;
    } catch (err) {
      console.error('getKnowledgeBaseById:', err);
      return null;
    }
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
      async () => await this.supabase.from("knowledge_base").insert([file]).select().single(),
      'File added to Knowledge Base successfully'
    );
  }

  async removeFile(fileId: string): Promise<FileOperationResult> {
    return this.genericFileOperation(
      async () => await this.supabase.from("knowledge_base").delete().eq("id", fileId).select().single(),
      'File removed from Knowledge Base successfully'
    );
  }
  async searchFiles(query: string): Promise<FileRow[]> {
    try {
      const { data, error } = await this.supabase
        .from("knowledge_base")
        .select("*")
        .ilike("file_name", `%${query}%`);

      if (error) throw error;
      return data ? data.map(file => this.transformDatabaseFile(file)) : [];
    } catch (err) {
      console.error('searchFiles:', err);
      return [];
    }
  }

  async getFilesByCategory(category: FileCategory): Promise<FileRow[]> {
    try {
      const { data, error } = await this.supabase
        .from("knowledge_base")
        .select("*")
        .eq("category", category);

      if (error) throw error;
      return data ? data.map(file => this.transformDatabaseFile(file)) : [];
    } catch (err) {
      console.error('getFilesByCategory:', err);
      return [];
    }
  }

  async updateFile(fileId: string, updates: Partial<FileRow>): Promise<FileOperationResult> {
    return this.genericFileOperation(
      async () => await this.supabase.from("knowledge_base").update(updates).eq("id", fileId).select().single(),
      'File updated in Knowledge Base successfully'
    );
  }

  // Archive functionality
  async archiveKnowledgeBaseFile(fileId: string): Promise<FileOperationResult> {
    const result = await this.archiveService.archiveFile(fileId);
    if (result.success) {
      // Perform any additional knowledge base specific operations
      // For example, update the status in the knowledge_base table
      await this.supabase
        .from("knowledge_base")
        .update({ status: 'archived' })
        .eq("id", fileId);
    }
    return result;
  }

  async restoreKnowledgeBaseFile(fileId: string): Promise<FileOperationResult> {
    const result = await this.archiveService.restoreFile(fileId);
    if (result.success) {
      // Perform any additional knowledge base specific operations
      // For example, update the status in the knowledge_base table
      await this.supabase
        .from("knowledge_base")
        .update({ status: 'active' })
        .eq("id", fileId);
    }
    return result;
  }

  async bulkArchiveKnowledgeBaseFiles(fileIds: string[]): Promise<FileOperationResult> {
    const result = await this.archiveService.bulkArchiveFiles(fileIds);
    if (result.success) {
      // Perform any additional knowledge base specific operations
      await this.supabase
        .from("knowledge_base")
        .update({ status: 'archived' })
        .in("id", fileIds);
    }
    return result;
  }

  async bulkRestoreKnowledgeBaseFiles(fileIds: string[]): Promise<FileOperationResult> {
    const result = await this.archiveService.bulkRestoreFiles(fileIds);
    if (result.success) {
      // Perform any additional knowledge base specific operations
      await this.supabase
        .from("knowledge_base")
        .update({ status: 'active' })
        .in("id", fileIds);
    }
    return result;
  }

  async getArchivedKnowledgeBaseFiles(page: number = 1, limit: number = 10): Promise<{ files: FileRow[]; total: number }> {
    try {
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      const { data, error, count } = await this.supabase
        .from("knowledge_base")
        .select('*', { count: 'exact' })
        .eq('status', 'archived')
        .order('archived_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      return {
        files: data ? data.map(file => this.transformDatabaseFile(file)) : [],
        total: count || 0
      };
    } catch (err) {
      console.error('getArchivedKnowledgeBaseFiles:', err);
      return { files: [], total: 0 };
    }
  }
}

export default new KnowledgeBaseService();