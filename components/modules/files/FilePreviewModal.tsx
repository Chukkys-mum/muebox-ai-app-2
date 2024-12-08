// components/modules/files/FilePreviewModal.tsx

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FilePreviewModalProps, FileAction } from '@/types';
import { formatFileSize, formatDate } from '@/utils/formatters';
import {
  Download,
  Share,
  Star,
  Pencil,
  Trash,
  ExternalLink
} from 'lucide-react';

export function FilePreviewModal({
  file,
  isOpen,
  onClose,
  onAction
}: FilePreviewModalProps) {
  // Helper function to safely parse dates
  const formatDateString = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return formatDate(date);
  };

  const renderPreview = () => {
    if (!file.mime_type) return null;

    if (file.mime_type.startsWith('image/')) {
      return (
        <img
          src={file.file_path || ''}
          alt={file.file_name}
          className="max-h-[60vh] object-contain"
        />
      );
    }

    if (file.mime_type.startsWith('video/')) {
      return (
        <video
          src={file.file_path || ''}
          controls
          className="max-h-[60vh] w-full"
        />
      );
    }

    if (file.mime_type.startsWith('audio/')) {
      return (
        <audio
          src={file.file_path || ''}
          controls
          className="w-full"
        />
      );
    }

    // For other file types, show file info
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">📄</div>
        <p className="text-muted-foreground">Preview not available for this file type</p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{file.file_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Preview */}
          <div className="bg-muted rounded-lg">
            {renderPreview()}
          </div>

          {/* File Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p><strong>Size:</strong> {formatFileSize(file.size)}</p>
              <p><strong>Type:</strong> {file.mime_type || 'Unknown'}</p>
              <p><strong>Created:</strong> {formatDateString(file.created_at)}</p>
              <p><strong>Modified:</strong> {formatDateString(file.updated_at)}</p>
            </div>
            <div className="space-y-2">
              <p><strong>Owner:</strong> {file.uploaded_by}</p>
              {file.is_shared && (
                <p>
                  <strong>Shared with:</strong>{' '}
                  {file.shared_with?.length || 0} users
                </p>
              )}
              {file.description && (
                <p>
                  <strong>Description:</strong>{' '}
                  {file.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction?.('download')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction?.('share')}
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction?.('star')}
            >
              <Star className="h-4 w-4 mr-2" />
              Star
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction?.('rename')}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Rename
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onAction?.('delete')}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}