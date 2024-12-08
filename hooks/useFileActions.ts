// /hooks/useFileActions.ts

import { useState } from 'react';
import { FileAction, FileRow, FileOperationResult } from '@/types/files';
import { fileService } from '@/services/files/FileService';
import { toast } from '@/components/ui/use-toast';

interface UseFileActionsProps {
  onSuccess?: () => void;
}

export function useFileActions({ onSuccess }: UseFileActionsProps = {}) {
  const [selectedFile, setSelectedFile] = useState<FileRow | null>(null);
  const [currentAction, setCurrentAction] = useState<FileAction | null>(null);

  const handleAction = async (file: FileRow, action: FileAction) => {
    setSelectedFile(file);
    setCurrentAction(action);
  };

  const handleDialogClose = () => {
    setSelectedFile(null);
    setCurrentAction(null);
  };

  const handleConfirm = async (params: {
    newName?: string;
    destinationFolderId?: string;
  }) => {
    if (!selectedFile || !currentAction) return;

    try {
      let result: FileOperationResult;

      switch (currentAction) {
        case 'rename':
          if (!params.newName) throw new Error('New name is required');
          result = await fileService.renameFile(selectedFile.id, params.newName);
          break;

        case 'move':
          if (params.destinationFolderId === undefined) 
            throw new Error('Destination folder is required');
          result = await fileService.moveFile(selectedFile.id, params.destinationFolderId);
          break;

        case 'copy':
          if (params.destinationFolderId === undefined) 
            throw new Error('Destination folder is required');
          result = await fileService.copyFile(selectedFile.id, params.destinationFolderId);
          break;

        default:
          throw new Error('Invalid action');
      }

      if (!result.success) {
        throw new Error(result.error || 'Operation failed');
      }

      toast({
        title: 'Success',
        description: result.message || `File ${currentAction}d successfully`,
      });

      onSuccess?.();
    } catch (error) {
      console.error(`Failed to ${currentAction} file:`, error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Operation failed',
        variant: 'destructive',
      });
    }

    handleDialogClose();
  };

  return {
    selectedFile,
    currentAction,
    handleAction,
    handleDialogClose,
    handleConfirm,
  };
}