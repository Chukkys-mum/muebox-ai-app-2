// components/modules/email/EmailRow.tsx

import React from 'react';
import { cn } from '@/utils/cn';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { File, MoreVertical, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface EmailSender {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

interface Email {
  id: string;
  sender: EmailSender;
  subject: string;
  body: string;
  isRead: boolean;
  isStarred: boolean;
  attachments?: Attachment[];
  created_at: string;
}

interface EmailRowProps {
  email: Email;
  isSelected: boolean;
  onSelect: (emailId: string) => void;
  onClick: (email: Email) => void;
}

const EmailRow = ({ email, isSelected, onSelect, onClick }: EmailRowProps) => {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 border-b cursor-pointer hover:bg-gray-50',
        !email.isRead && 'bg-gray-50',
        isSelected && 'bg-blue-50'
      )}
      onClick={() => onClick(email)}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onSelect(email.id)}
        onClick={(e) => e.stopPropagation()}
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation();
          // Toggle star
        }}
      >
        <Star
          className={cn(
            'h-4 w-4',
            email.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
          )}
        />
      </Button>
      <Avatar className="h-8 w-8">
        <AvatarImage src={email.sender.avatar} />
        <AvatarFallback>{email.sender.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={cn('font-semibold', email.isRead && 'font-normal')}>
            {email.sender.name}
          </span>
          <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(email.created_at), { addSuffix: true })}
          </span>
        </div>
        <h4 className={cn('text-sm mb-1', !email.isRead && 'font-semibold')}>
          {email.subject}
        </h4>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500 truncate">{email.body}</p>
          {email.attachments && email.attachments.length > 0 && (
            <File className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Mark as {email.isRead ? 'unread' : 'read'}</DropdownMenuItem>
          <DropdownMenuItem>{email.isStarred ? 'Unstar' : 'Star'}</DropdownMenuItem>
          <DropdownMenuItem>Archive</DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default EmailRow;