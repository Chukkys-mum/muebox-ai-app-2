// /types/trash.ts

export interface FileRow {
    id: string;
    name: string;
    size: number;
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