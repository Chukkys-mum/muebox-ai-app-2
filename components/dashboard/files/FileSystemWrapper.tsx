// app/components/FileSystemWrapper.tsx

'use client';

import { FileService } from '@/services/files/FileService';
import FileListGrid from '@/components/dashboard/files/FileListGrid';
import FolderListGrid from '@/components/dashboard/files/FolderListGrid';
import { handleEntityAction } from '@/app/actions/fileSystemActions';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import type { FileRow, FileAction } from '@/types';

export default function FileSystemWrapper() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [files, setFiles] = useState<FileRow[]>([]);
  const [folders, setFolders] = useState<FileRow[]>([]);

  const handleAction = async (action: FileAction, entityId: string, entityType: 'file' | 'folder') => {
    try {
      setIsLoading(true);
      const result = await handleEntityAction(action, entityId, entityType);
      
      if (typeof result === 'string') {
        // Handle download links
        window.open(result, '_blank');
      } else {
        if (result.success) {
          toast({
            title: 'Success',
            description: result.message
          });
          // Refresh files/folders after successful action
          const fileService = new FileService();
          const [newFiles, newFolders] = await Promise.all([
            fileService.fetchFiles(),
            fileService.fetchFolders()
          ]);
          setFiles(newFiles);
          setFolders(newFolders);
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FolderListGrid 
        folders={folders} 
        onAction={(action, folderId) => handleAction(action, folderId, 'folder')}
        isLoading={isLoading}
      />
      
      <FileListGrid 
        files={files} 
        onAction={(action, fileId) => handleAction(action, fileId, 'file')}
        isLoading={isLoading}
      />
    </div>
  );
}