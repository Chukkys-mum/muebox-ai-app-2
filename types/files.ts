// types/file.ts

import { WithTimestamps, WithStatus } from './common';

export type FileStatus = 'active' | 'archived' | 'deleted' | 'trashed' | 'knowledge_base';
export type FileCategory = 'image' | 'video' | 'audio' | 'document' | 'code' | 'archive' | 'other';
export type FilePermission = 'read' | 'write' | 'delete' | 'share';
export type FileOperation = 'upload' | 'download' | 'delete' | 'restore' | 'move' | 'copy';


// File interface - // Represents a file or folder row in the table
export interface File extends WithTimestamps, WithStatus {
  id: string;
  related_entity_type?: string;
  related_entity_id?: string;
  file_name: string;
  file_type?: string;
  file_path?: string;
  uploaded_by: string;
  category?: string;
  extension?: string;
}

export interface FileVersion {
  id: string;
  file_id: string;
  version_number: number;
  file_path?: string;
  uploaded_by: string;
  created_at: string;
}

export interface FileSharing {
  file_id: string;
  shared_with: string; // user_id or email
  permissions: FilePermission[];
  expiry_date?: string;
}


export interface FilePermissions {
  read: boolean;
  write: boolean;
  delete: boolean;
}


export interface CompatibleFileRow extends Omit<TrashRow, 'status' | 'category'> {
  status: FileStatus;
  category: FileCategory | null;
  is_pinned: boolean;
  starred: boolean;
  tags: string[];
  description: string;
  is_shared: boolean;
  shared_with: string[];
  permissions: any | null;
  user_id: string;
}

export interface FileRow {
  // Core properties
  id: string;
  file_name: string; // Changed from 'name' to match database schema
  size: number;
  type: 'file' | 'folder' | 'knowledge_base';
  status: FileStatus;
  
  // File-specific properties
  category: FileCategory | null; // Made nullable to match database schema "image" | "video" | "audio" | "document" | "code" | "archive" | "other"; // Optional category
  extension: string | null; // Made nullable to match database schema
  mime_type: string | null; // Changed from 'mimeType' to match database schema

  related_entity_type: string | null; // Made nullable to match database schema
  related_entity_id: string | null; // Made nullable to match database schema
  file_path: string | null; // Made nullable to match database schema
  uploaded_by: string;
  
  // Organization
  parent_id: string | null; // Made nullable to match database schema
  is_pinned: boolean | null; // Made nullable to match database schema
  starred: boolean | null; // Made nullable to match database schema
  tags: string[] | null; // Made nullable to match database schema
  description: string | null; // Made nullable to match database schema
  
  // Timestamps
  created_at: string;
  updated_at: string; // Changed from 'modified_at' to match database schema
  deleted_at: string | null; // Made nullable to match database schema
  archived_at: string | null; // Made nullable to match database schema
  
  // Sharing and permissions
  is_shared: boolean | null; // Made nullable to match database schema
  shared_with: string[] | null; // Made nullable to match database schema
  permissions: Record<string, boolean> | null; // Changed to match database schema
  user_id: string; // Owner of the file
  
  // Optional metadata
  metadata: Record<string, any> | null; // Changed to match database schema
}

/**
 * Represents a specialized entity for knowledge base content.
 */

export interface FileListResponse {
  files: FileRow[];
  total: number;
  cursor?: string;
}

export interface FileStorageUsage {
  used: number;
  total: number;
  breakdown: Record<string, number>;
}

export interface FileSettings {
  id: number;
  maxFileSize: number | null;
  allowedFileTypes: string[] | null;
  updated_at: string;
}

export interface FileOperationResult {
  success: boolean;
  message?: string;
  error?: string;
  file?: FileRow;
  files?: FileRow[];  // Add this for bulk operations
}

export interface FileMetadata {
  size: number;
  created_at: string;
  last_modified: string;
  mime_type: string;
  checksum?: string;
}

export interface FileTableProps {
    data: FileRow[]; // Array of files or folders to be displayed
    onDelete: (ids: string[]) => Promise<void>; // Function to handle file deletion
    onRestore?: (ids: string[]) => Promise<void>; // Function to handle restoring files (optional for trash/archives)
    isLoading: boolean; // Indicates whether the table is in a loading state
    config: {
      tableName: string; // Name of the table (for UI and search bar placeholders)
      columns: Array<{ key: keyof FileRow; label: string }>; // Table column definitions
      searchableColumns: Array<keyof FileRow>; // Columns that can be searched
    };
  }
  
  /**
   * Represents a folder entity, with nested child files or folders.
   */
  export interface Folder extends FileRow {
    children?: FileRow[]; // Child files or folders within this folder
  }
  
  /**
   * Additional metadata for folders in the knowledge base.
   */
  export interface KnowledgeBaseFolder extends Folder {
    knowledgeBaseType: "public" | "private" | "safeguard"; // Specifies the type of knowledge base folder
    safeguardRules?: {
      // Rules specific to safeguarded knowledge bases
      encryption: boolean; // Whether files are encrypted
      expirationDate?: string; // Optional expiration date for file access
    };
  }
  
  /**
   * Props for file upload modals.
   */
  export interface FileUploadModalProps {
    onClose: () => void; // Function to handle closing the modal
    onUploadSuccess: () => void; // Callback triggered when upload is successful
    maxUploadSize: number; // Maximum file size allowed for uploads (in bytes)
    allowedFileTypes?: string[]; // List of allowed file extensions
  }
  
  export type FileAction = 
  | 'share'
  | 'move'
  | 'star'
  | 'rename'
  | 'download'
  | 'report'
  | 'delete';

  /**
   * Props for file and folder actions dropdowns.
   */
  export interface FileActionProps {
    onShare: (fileId: string) => void; // Function to handle sharing files or folders
    onRename: (fileId: string) => void; // Function to handle renaming files or folders
    onMove: (fileId: string, destinationFolderId: string) => void; // Function to handle moving files or folders
    onDelete: (fileId: string) => void; // Function to handle deletion of files or folders
    onDownload: (fileId: string) => void; // Function to handle file downloads
    onPin?: (fileId: string) => void; // Function to handle pinning files or folders
    onUnpin?: (fileId: string) => void; // Function to handle unpinning files or folders
  }
  
  /**
   * Represents a safeguard folder in the knowledge base.
   */
  export interface SafeguardFolder extends KnowledgeBaseFolder {
    restrictedAccess: boolean; // Indicates if access is restricted to specific users
    auditLogsEnabled: boolean; // Whether access logs are enabled
    dataRetentionPolicy?: string; // Optional policy for data retention
  }
  

/**
   * Props for a trash or archive table component.
   */


// Trahs interface - Represents a trashed file or folder
export interface Trash {
  id: string;
  name?: string;
  size?: number;
  user_id: string;
  deleted_at: string;
}

export interface TrashRow {
  id: string;
  file_name: string;
  size: number;
  type: 'file' | 'folder';
  status: FileStatus;
  category: FileCategory | null;
  extension: string | null;
  mime_type: string | null;
  file_type: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  archived_at: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  file_path: string | null;
  uploaded_by: string;
  metadata: Record<string, any> | null;
}
  
export interface TrashOrArchiveTableProps {
  data: FileRow[]; // Array of trashed or archived files
  onRestore: (ids: string[]) => Promise<void>; // Function to handle restoring files
  onDelete: (ids: string[]) => Promise<void>; // Function to handle permanent deletion
  isLoading: boolean; // Indicates whether the table is in a loading state
  config: {
    tableName: string; // Name of the table (e.g., "Trash" or "Archive")
    columns: Array<{ key: keyof FileRow; label: string }>; // Table column definitions
    searchableColumns: Array<keyof FileRow>; // Columns that can be searched
  };
}

  export interface TrashTableProps {
    data: FileRow[];
    onRestore: (id: string) => void;
    onDelete: (id: string) => void;
    isLoading: boolean;
  }

export interface TrashcanTableProps {
  data: FileRow[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

