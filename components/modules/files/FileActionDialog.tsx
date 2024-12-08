// /components/modules/files/FileActionDialog.tsx

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileAction, FileRow } from "@/types/files";
import { FolderTree } from './FolderTree';

interface FileActionDialogProps {
  action: FileAction;
  file: FileRow;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (params: {
    newName?: string;
    destinationFolderId?: string;
  }) => Promise<void>;
}

export default function FileActionDialog({
  action,
  file,
  isOpen,
  onClose,
  onConfirm
}: FileActionDialogProps) {
  const [newName, setNewName] = useState(file.file_name);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getTitle = () => {
    switch (action) {
      case 'rename': return 'Rename File';
      case 'move': return 'Move to Folder';
      case 'copy': return 'Copy to Folder';
      default: return 'File Action';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm({
        newName: action === 'rename' ? newName : undefined,
        destinationFolderId: ['move', 'copy'].includes(action) ? selectedFolderId || undefined : undefined
      });
      onClose();
    } catch (error) {
      console.error('Failed to perform action:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {action === 'rename' && (
            <div className="space-y-2">
              <Label htmlFor="fileName">New Name</Label>
              <Input
                id="fileName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new file name"
                required
              />
            </div>
          )}

          {['move', 'copy'].includes(action) && (
            <div className="space-y-2">
              <Label>Select Destination Folder</Label>
              <FolderTree
                currentFolderId={file.parent_id}
                onSelect={setSelectedFolderId}
                selectedId={selectedFolderId}
              />
            </div>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={loading || (action === 'rename' && !newName) || 
                (['move', 'copy'].includes(action) && !selectedFolderId)}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}