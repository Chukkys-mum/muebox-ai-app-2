// File: components/chat/Message/MessageAttachments.tsx

import { useState } from 'react';
import { MessageAttachmentsProps, MessageAttachment } from '@/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  File, 
  Image, 
  Video, 
  AudioLines,
  Download, 
  Eye
} from 'lucide-react';

export function MessageAttachments({
  attachments,
  onImageClick,
  onFileClick,
  layout = 'grid'
}: MessageAttachmentsProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, number>>({});

  const handleDownload = async (attachment: MessageAttachment) => {
    try {
      setLoadingStates(prev => ({ ...prev, [attachment.id]: 0 }));
      
      const response = await fetch(attachment.url);
      const contentLength = Number(response.headers.get('content-length'));
      const reader = response.body?.getReader();
      
      if (!reader) throw new Error('Failed to start download');

      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        
        const progress = (receivedLength / contentLength) * 100;
        setLoadingStates(prev => ({ ...prev, [attachment.id]: progress }));
      }

      const blob = new Blob(chunks);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setLoadingStates(prev => {
        const newState = { ...prev };
        delete newState[attachment.id];
        return newState;
      });
    } catch (error) {
      console.error('Download failed:', error);
      setLoadingStates(prev => {
        const newState = { ...prev };
        delete newState[attachment.id];
        return newState;
      });
    }
  };

  const renderAttachmentIcon = (type: MessageAttachment['type']) => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'audio': return <AudioLines className="h-5 w-5" />;
      default: return <File className="h-5 w-5" />;
    }
  };

  const renderAttachment = (attachment: MessageAttachment) => {
    const isLoading = attachment.id in loadingStates;
    const progress = loadingStates[attachment.id] || 0;

    if (attachment.type === 'image') {
      return (
        <div
          key={attachment.id}
          className="relative group cursor-pointer overflow-hidden rounded-md"
          onClick={() => onImageClick?.(attachments.indexOf(attachment))}
        >
          <img
            src={attachment.thumbnailUrl || attachment.url}
            alt={attachment.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-2 left-2 text-white text-sm">
              {attachment.name}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={attachment.id}
        className="flex items-center gap-3 p-3 rounded-md border bg-background"
      >
        {renderAttachmentIcon(attachment.type)}
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attachment.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(attachment.size)}
          </p>
          {isLoading && (
            <Progress value={progress} className="h-1 mt-2" />
          )}
        </div>

        <div className="flex gap-2">
          {onFileClick && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onFileClick(attachment)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleDownload(attachment)}
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={
      layout === 'grid'
        ? 'grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2'
        : 'flex flex-col gap-2 mt-2'
    }>
      {attachments.map(renderAttachment)}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}