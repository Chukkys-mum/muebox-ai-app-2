// types/knowledgeBase.ts

import { WithTimestamps, WithStatus } from './common';
import { FileRow } from './files';

// Knowledge Base Type
export type KnowledgeBaseType = 'public' | 'private' | 'safeguard';

// Knowledge Base interface
export interface KnowledgeBase extends WithTimestamps, WithStatus {
  id: string;
  name: string;
  description?: string;
  type: KnowledgeBaseType;
  file_path?: string;
  size?: number;
}

export interface KnowledgeBaseFile extends FileRow {
  knowledge_base_id: string;
  knowledgeBaseType: "public" | "private" | "safeguard";
  safeguardRules?: {
    encryption: boolean;
    expirationDate?: string;
  };
}


// You can add more knowledge base-related types or interfaces here as needed

// For example, you might want to add types for knowledge base queries or updates:

export interface KnowledgeBaseQuery {
  query: string;
  knowledge_base_id: string;
  max_results?: number;
}

export interface KnowledgeBaseUpdate extends Partial<Omit<KnowledgeBase, 'id' | 'created_at' | 'updated_at'>> {
  id: string;
}

// Or types for knowledge base permissions:

export type KnowledgeBasePermission = 'read' | 'write' | 'delete' | 'share';

export interface KnowledgeBaseAccess {
  knowledge_base_id: string;
  user_id: string;
  permissions: KnowledgeBasePermission[];
}