// /components/modules/email/EmailDetail.tsx

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  Reply,
  ReplyAll,
  Forward,
  Archive,
  Trash2,
  Star,
  ChevronLeft,
  Paperclip
} from "lucide-react";
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { cn } from '@/utils/cn';

interface Recipient {
    name: string;
    email: string;
  }

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

interface EmailDetailProps {
  email: {
    id: string;
    subject: string;
    sender: {
      name: string;
      email: string;
      avatar?: string;
    };
    recipients: {
      to: { name: string; email: string; }[];
      cc?: { name: string; email: string; }[];
      bcc?: { name: string; email: string; }[];
    };
    content: string;
    timestamp: Date;
    attachments?: Attachment[];
    starred: boolean;
  };
}

export default function EmailDetail({ email }: EmailDetailProps) {
  const [isStarred, setIsStarred] = useState(email.starred);
  
  const handleStar = () => {
    setIsStarred(!isStarred);
    // TODO: Implement star functionality
  };

  const handleDownload = (attachment: Attachment) => {
    // TODO: Implement download functionality
    console.log('Downloading:', attachment.name);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Email Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <Link href="/dashboard/email">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Inbox
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStar}
            >
              <Star className={cn(
                "h-4 w-4",
                isStarred && "fill-yellow-400 text-yellow-400"
              )} />
            </Button>

            <Button variant="ghost" size="icon">
              <Archive className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Mark Unread</DropdownMenuItem>
                <DropdownMenuItem>Print</DropdownMenuItem>
                <DropdownMenuItem>Block Sender</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <h1 className="text-2xl font-semibold mb-4">{email.subject}</h1>

        <div className="flex items-start gap-4">
          <Avatar className="mt-1">
            {email.sender.avatar ? (
              <img 
                src={email.sender.avatar} 
                alt={email.sender.name} 
                className="aspect-square h-full w-full"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                {email.sender.name.charAt(0)}
              </div>
            )}
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold">{email.sender.name}</span>
                <span className="text-muted-foreground ml-2">{`<${email.sender.email}>`}</span>
              </div>
              <span className="text-muted-foreground">
                {format(email.timestamp, 'MMM d, yyyy h:mm a')}
              </span>
            </div>

            <div className="text-sm text-muted-foreground">
              <span>To: </span>
              {email.recipients.to.map((recipient, i) => (
                <span key={recipient.email}>
                  {recipient.name} {`<${recipient.email}>`}
                  {i < email.recipients.to.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>

            {/* CC Recipients Section */}
            {Array.isArray(email.recipients.cc) && email.recipients.cc.length > 0 && (
            <div className="text-sm text-muted-foreground">
                <span>Cc: </span>
                {email.recipients.cc.map((recipient, i) => (
                <span key={recipient.email}>
                    {recipient.name} {`<${recipient.email}>`}
                    {i < (email.recipients.cc?.length ?? 0) - 1 ? ', ' : ''}
                </span>
                ))}
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: email.content }} />
      </div>

      {/* Attachments */}
      {email.attachments && email.attachments.length > 0 && (
        <div className="border-t p-4">
          <h3 className="text-sm font-semibold mb-2">
            Attachments ({email.attachments.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {email.attachments.map((attachment) => (
              <Button
                key={attachment.id}
                variant="outline"
                className="text-sm"
                onClick={() => handleDownload(attachment)}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                <span>{attachment.name}</span>
                <span className="text-muted-foreground ml-2">
                  ({attachment.size})
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Button>
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
          <Button variant="outline">
            <ReplyAll className="h-4 w-4 mr-2" />
            Reply All
          </Button>
          <Button variant="outline">
            <Forward className="h-4 w-4 mr-2" />
            Forward
          </Button>
        </div>
      </div>
    </div>
  );
}