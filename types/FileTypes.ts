// types/FileTypes.ts

export interface FileRow {
    id: string; // Unique ID for the file or folder
    name: string; // Name of the file or folder
    size: string; // Size in bytes
    type: "file" | "folder"; // Indicates whether it’s a file or folder
    category:
      | "image"
      | "video"
      | "audio"
      | "document"
      | "code"
      | "archive"
      | "other"; // File category
    extension?: string; // Optional file extension (e.g., .jpg, .pdf)
    mimeType?: string; // Optional MIME type (e.g., image/jpeg)
    modified_at: string; // Timestamp for the last modification
    created_at: string; // Timestamp for the file creation
    is_pinned?: boolean; // Indicates if the file or folder is pinned
    parent_id?: string; // Optional ID of the parent folder (for nested structures)
    tags?: string[]; // Optional tags for categorizing or searching files
    description?: string; // Optional description or notes about the file
    is_shared?: boolean; // Indicates if the file is shared
    shared_with?: string[]; // Optional list of user IDs or emails the file is shared with
    permissions?: {
      read: boolean;
      write: boolean;
      delete: boolean;
    }; // Access permissions for the file
    deleted?: boolean; // Indicates if the file is in the trash
  }
  
  export interface KnowledgeBaseFile {
    id: string; // Unique ID for knowledge base file or folder
    name: string; // Name of the file or folder
    size: number; // Size in MB (folders can have a cumulative size or 0 if uncalculated)
    type: "file" | "folder"; // Specifies if the item is a file or folder
    category?:
      | "image"
      | "video"
      | "audio"
      | "document"
      | "code"
      | "archive"
      | "other"; // Applicable for files
    extension?: string; // Optional file extension (e.g., .jpg, .pdf)
    parent_id?: string; // Parent folder ID for hierarchical organization
    is_pinned?: boolean; // Indicates if the item is pinned
    updated_at: string; // Timestamp of the last update
    created_at?: string; // Timestamp of creation
    description?: string; // Optional description or metadata for the item
    permissions?: {
      read: boolean;
      write: boolean;
      delete: boolean;
    }; // Access permissions for the file or folder
  }
  
  