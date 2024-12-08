// /components/modules/files/FolderTree.tsx

import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, Folder } from 'lucide-react';
import { FileRow } from '@/types/files';
import { fileService } from '@/services/files/FileService';
import { cn } from '@/utils/cn';

interface FolderTreeProps {
  currentFolderId: string | null;
  onSelect: (folderId: string | null) => void;
  selectedId: string | null;
}

export function FolderTree({ 
  currentFolderId, 
  onSelect, 
  selectedId 
}: FolderTreeProps) {
  const [folders, setFolders] = useState<FileRow[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFolders = async () => {
      try {
        const folderList = await fileService.fetchFolders();
        setFolders(folderList);
      } catch (error) {
        console.error('Failed to load folders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFolders();
  }, []);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const renderFolder = (folder: FileRow, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedId === folder.id;
    const isDisabled = folder.id === currentFolderId;
    const childFolders = folders.filter(f => f.parent_id === folder.id);

    return (
      <div key={folder.id} className="select-none">
        <div
          className={cn(
            "flex items-center gap-2 py-1 px-2 rounded cursor-pointer",
            isSelected && "bg-accent",
            isDisabled && "opacity-50 cursor-not-allowed",
            !isDisabled && "hover:bg-accent/50"
          )}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => !isDisabled && onSelect(folder.id)}
        >
          <button
            type="button"
            className="h-4 w-4 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              toggleFolder(folder.id);
            }}
          >
            {childFolders.length > 0 && (
              isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            )}
          </button>
          <Folder className="h-4 w-4 shrink-0" />
          <span className="truncate">{folder.file_name}</span>
        </div>

        {isExpanded && childFolders.map(child => renderFolder(child, level + 1))}
      </div>
    );
  };

  if (loading) {
    return <div>Loading folders...</div>;
  }

  return (
    <div className="border rounded-md p-2 max-h-64 overflow-y-auto">
      <div
        className={cn(
          "flex items-center gap-2 py-1 px-2 rounded cursor-pointer",
          selectedId === null && "bg-accent",
          "hover:bg-accent/50"
        )}
        onClick={() => onSelect(null)}
      >
        <Folder className="h-4 w-4" />
        <span>Root</span>
      </div>
      {folders
        .filter(folder => !folder.parent_id)
        .map(folder => renderFolder(folder))}
    </div>
  );
}