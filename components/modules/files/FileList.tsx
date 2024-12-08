// /components/modules/files/FileList.tsx
import { useState } from 'react';
import FileActionDialog from '@/components/modules/files/FileActionDialog'; 
import { useFileActions } from '@/hooks/useFileActions';
import { FileRow } from '@/types/files';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FileListProps {
  files: FileRow[];
  onRefresh: () => void;
}

export function FileList({ files, onRefresh }: FileListProps) {
  const {
    selectedFile,
    currentAction,
    handleAction,
    handleDialogClose,
    handleConfirm,
  } = useFileActions({ onSuccess: onRefresh });

  const renderFileActions = (file: FileRow) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleAction(file, 'rename')}>
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction(file, 'move')}>
          Move
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction(file, 'copy')}>
          Copy
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <h3 className="font-medium">{file.file_name}</h3>
              <p className="text-sm text-muted-foreground">
                {file.size} • {file.type}
              </p>
            </div>
            {renderFileActions(file)}
          </div>
        ))}
      </div>

      {selectedFile && currentAction && (
        <FileActionDialog
          action={currentAction}
          file={selectedFile}
          isOpen={true}
          onClose={handleDialogClose}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}