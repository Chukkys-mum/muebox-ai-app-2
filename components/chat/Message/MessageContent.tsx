// File: components/chat/Message/MessageContent.tsx

import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { MessageBoxProps } from '@/types/chat';

export function MessageContent({
  message,
  showFormatting = true,
  maxHeight,
  isEditing,
  onEditComplete
}: MessageBoxProps) {
  const content = showFormatting ? message.content : message.rawContent || message.content;
  
  if (isEditing) {
    return (
      <div className="flex flex-col gap-2">
        <Textarea
          defaultValue={content}
          className="min-h-[100px] resize-none"
          placeholder="Edit your message..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && onEditComplete) {
              onEditComplete(e.currentTarget.value);
            }
          }}
        />
        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEditComplete?.(content)}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => onEditComplete?.(content)}
          >
            <Check className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={`
        relative overflow-hidden
        ${message.role === 'assistant' 
          ? 'bg-zinc-950 text-white dark:bg-white/5'
          : 'bg-background'
        }
        ${maxHeight ? `max-h-[${maxHeight}px]` : ''}
      `}
    >
      <div className="px-5 py-4">
        {showFormatting ? (
          <ReactMarkdown className="prose dark:prose-invert">
            {content}
          </ReactMarkdown>
        ) : (
          <p className="text-base font-normal leading-6">
            {content}
          </p>
        )}
      </div>
    </Card>
  );
}

export default MessageContent;