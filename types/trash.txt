// /types/trash.ts

export interface FileRow {
  id: string;
  name: string;
  size: number;
  category?: string; // Add this if you're using it in the table
  deletedAt: string;
  tags?: string[];
  description?: string;
}
  
  export interface TrashTableProps {
    data: FileRow[];
    onRestore: (id: string) => void;
    onDelete: (id: string) => void;
    isLoading: boolean;
  }