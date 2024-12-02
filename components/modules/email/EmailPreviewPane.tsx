import React from 'react';
import { Card } from '@/components/ui/card';
import { formatDistance } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { File, Reply, Share, Star, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Email } from '@/types/email';

interface EmailPreviewPaneProps {
  email: Email;
  onClose?: () => void;
  className?: string;
}

const EmailPreviewPane = ({ email, onClose, className }: EmailPreviewPaneProps) => {
  const formattedDate = React.useMemo(() =>
    formatDistance(new Date(email.created_at), new Date(), { addSuffix: true }),
    [email.created_at]
  );

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar>
            {email.sender.avatar && (
              <AvatarImage src={email.sender.avatar} alt={email.sender.name} />
            )}
            <AvatarFallback>
              {email.sender.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{email.sender.name}</h3>
            <p className="text-sm text-gray-500">{email.sender.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{formattedDate}</span>
          {email.attachments && email.attachments.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <File className="h-4 w-4" />
              {email.attachments.length}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold mb-2">{email.subject || 'No Subject'}</h2>
        <div
          className="prose max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: email.body }}
        />
      </div>

      {email.attachments && email.attachments.length > 0 && (
        <div className="p-4 border-b">
          <h4 className="font-semibold mb-2">Attachments</h4>
          <div className="flex flex-wrap gap-2">
            {email.attachments.map((attachment) => (
              <Badge
                key={attachment.id}
                variant="secondary"
                className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <File className="h-4 w-4" />
                {attachment.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 mt-auto border-t">
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Reply className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors" />
            <Share className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors" />
            <Star 
              className={cn(
                "h-5 w-5 cursor-pointer transition-colors",
                email.starred ? "text-yellow-500 hover:text-yellow-600" : "text-gray-500 hover:text-gray-700"
              )} 
            />
          </div>
          <Trash2 className="h-5 w-5 text-gray-500 cursor-pointer hover:text-red-500 transition-colors" />
        </div>
      </div>
    </Card>
  );
};

export default EmailPreviewPane;