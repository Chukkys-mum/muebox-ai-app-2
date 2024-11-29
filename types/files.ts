// File: /types/files.ts

// Represents a file or folder row in the table
export interface FileRow {
    id: string; // Unique identifier for the file or folder
    name: string; // Name of the file or folder
    size: string; // Size of the file or folder, e.g., in MB, GB
    type: "file" | "folder"; // Indicates whether it's a file or a folder
    category?: "image" | "video" | "audio" | "document" | "code" | "archive" | "other"; // Optional category
    extension?: string; // Optional file extension (e.g., .jpg, .pdf)
    mimeType?: string; // Optional MIME type (e.g., image/jpeg, application/pdf)
    modified_at: string; // Last modified timestamp
    created_at: string; // Created timestamp
    is_pinned?: boolean; // Optional: Indicates if the file or folder is pinned
    parent_id?: string; // Optional: ID of the parent folder
    tags?: string[]; // Optional tags for categorization or search
    description?: string; // Optional description of the file or folder
    is_shared?: boolean; // Optional: Indicates if the file is shared
    shared_with?: string[]; // Optional: Users or groups the file is shared with
    permissions?: {
      read: boolean;
      write: boolean;
      delete: boolean;
    }; // Optional permissions object
  }
  
  // Props for the FileTable component
  export interface FileTableProps {
    data: FileRow[]; // Array of file or folder rows to display
    onDelete: (ids: string[]) => Promise<void>; // Function to handle deletion of selected files
    isLoading: boolean; // Loading state for the table
    config: {
      tableName: string; // Name of the table
      columns: Array<{ key: keyof FileRow; label: string }>; // Columns configuration
      searchableColumns: Array<keyof FileRow>; // Array of searchable column keys
    };
  }
  