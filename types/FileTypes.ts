// types/FileTypes.ts

/**
 * Represents a generic file or folder entity.
 */
export interface FileRow {
    id: string; // Unique identifier for the file or folder
    name: string; // Name of the file or folder
    size: string | number; // Size in bytes (files only) or number (for knowledge base cumulative size)
    type: "file" | "folder"; // Indicates whether it's a file or a folder
    category?:
      | "image"
      | "video"
      | "audio"
      | "document"
      | "code"
      | "archive"
      | "other"; // Category for files
    extension?: string; // Optional file extension (e.g., .jpg, .pdf)
    mimeType?: string; // MIME type for files (e.g., image/jpeg)
    parent_id?: string; // Optional ID of the parent folder (for nested structures)
    modified_at: string; // Last modification timestamp
    created_at: string; // Creation timestamp
    is_pinned?: boolean; // Indicates whether the file or folder is pinned
    tags?: string[]; // Tags for categorizing or searching files
    description?: string; // Optional description or notes about the file or folder
    is_shared?: boolean; // Indicates whether the file is shared
    shared_with?: string[]; // List of user IDs or emails with whom the file is shared
    permissions?: {
      read: boolean; // Read access
      write: boolean; // Write access
      delete: boolean; // Delete access
    }; // Access permissions for the file or folder
    deleted?: boolean; // Indicates whether the file or folder is in the trash
    starred?: boolean; // Indicates if the file or folder is marked as a favorite
    status: 'active' | 'archived' | 'deleted' | 'trashed';
    archived_at?: string;
  }
  
  /**
   * Represents a specialized entity for knowledge base content.
   */
  export interface KnowledgeBaseFile extends FileRow {
    size: number; // Knowledge base items may have a cumulative size or 0 for folders
    updated_at: string; // Last updated timestamp
    is_pinned?: boolean; // Indicates whether the knowledge base item is pinned
    description?: string; // Optional detailed description for knowledge base items
  }
  
  /**
   * Props for tables displaying files or folders.
   */
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
   * Props for a trash or archive table component.
   */
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
  