// File: components/chat/Message/index.tsx

import { useState, useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Bot } from 'lucide-react';
import { ChatMessage, User, ChatUser } from '@/types';
import { MessageContent } from './MessageContent';
import { MessageActions } from './MessageActions';
import { MessageAttachments } from './MessageAttachments';
import { ChatContext } from '@/context/ChatContext';

interface MessageProps {
  message: ChatMessage;
  user: User;
  sender: User;
  showActions?: boolean;
}

export function Message({ message, sender, showActions = true }: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error('Message must be used within ChatProvider');
  }

  const { currentUser, editMessage, deleteMessage } = context;
  const isOwnMessage = message.sender_id === currentUser.id;

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditing(true);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    await deleteMessage(message.id);
  };

  const handleEditComplete = async (newContent: string) => {
    await editMessage(message.id, newContent);
    setIsEditing(false);
  };

  return (
    <div className={`group relative flex w-full gap-3 px-4 py-3 ${
      isOwnMessage ? 'flex-row-reverse' : 'flex-row'
    }`}>
      {/* Avatar */}
      <Avatar>
        <AvatarImage src={sender.avatar_url || undefined} />
        <AvatarFallback>
          {sender.full_name?.charAt(0) || sender.email.charAt(0)}
          <UserIcon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[80%] ${
        isOwnMessage ? 'items-end' : 'items-start'
      }`}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">
            {sender.full_name || sender.email}
          </span>
          <Badge variant="secondary">
            {isOwnMessage ? 'You' : 'User'}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(message.created_at).toLocaleTimeString()}
          </span>
        </div>

        {/* Content */}
        <div className={`rounded-lg px-4 py-2 ${
          isOwnMessage
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}>
          {isEditing ? (
            <MessageContent
              message={message}
              isEditing={true}
              onEditComplete={handleEditComplete}
            />
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Message Status */}
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          {message.is_read && <span>Read</span>}
          {message.read_at && (
            <span>• {new Date(message.read_at).toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <MessageActions
          message={message}
          currentUser={currentUser}
          onEdit={handleEdit}
          onDelete={handleDelete}
          variant={isOwnMessage ? 'sent' : 'received'}
        />
      )}
    </div>
  );
}