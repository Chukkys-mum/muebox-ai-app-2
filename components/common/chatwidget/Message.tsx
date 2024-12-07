// components/chatwidget/Message.tsx 
'use client';

import { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { ChatMessage } from './context/types/types';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

interface MessageProps {
  message: ChatMessage;
}

export const Message = ({ message }: MessageProps) => {
  const { retryMessage } = useChat();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryMessage(message.id);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div
      className={cn(
        'message group',
        'max-w-[80%] p-4 mb-3 shadow-sm',
        'transition-opacity duration-300',
        message.status === 'sending' && 'opacity-70',
        message.type === 'user'
          ? 'ml-auto bg-blue-500 text-white rounded-[20px]'
          : 'mr-auto bg-gray-100 text-gray-900 rounded-[20px]'
      )}
    >
      <div className="relative">
        <div className="message-content whitespace-pre-wrap">
          {message.content}
        </div>
        
        {message.status === 'failed' && (
          <div className="mt-2 flex items-center gap-2 text-red-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Failed to send</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRetry}
              disabled={isRetrying}
              className="p-1 hover:bg-red-100"
            >
              <RefreshCcw className={cn(
                "w-4 h-4",
                isRetrying && "animate-spin"
              )} />
            </Button>
          </div>
        )}

        <div className="text-xs opacity-70 mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
};

export const TypingIndicator = () => (
  <div className="flex space-x-2 p-3 bg-gray-100 rounded-[20px] mr-auto mb-3">
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
  </div>
);

export default Message;