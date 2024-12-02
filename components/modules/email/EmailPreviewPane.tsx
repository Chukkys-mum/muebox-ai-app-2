// components/modules/email/EmailPreviewPane.tsx

import React from 'react';
import { Card } from '@/components/ui/card';
import { Email } from '@/types/types';
import { formatDistance } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { File, Reply, Share, Star, Trash2 } from 'lucide-react';

interface EmailPreviewPaneProps {
  email: Email;
  onClose?: () => void;
}

const EmailPreviewPane = ({ email, onClose }: EmailPreviewPaneProps) => {
  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={email.sender.avatar} />
            <AvatarFallback>{email.sender.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{email.sender.name}</h3>
            <p className="text-sm text-gray-500">{email.sender.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {formatDistance(new Date(email.created_at), new Date(), { addSuffix: true })}
          </span>
          {email.attachments && email.attachments.length > 0 && (
            <Badge variant="secondary">
              <File className="h-4 w-4 mr-1" />
              {email.attachments.length}
            </Badge>
          )}
        </div>
      </div>
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold mb-2">{email.subject}</h2>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: email.body }} />
      </div>
      {email.attachments && email.attachments.length > 0 && (
        <div className="p-4 border-b">
          <h4 className="font-semibold mb-2">Attachments</h4>
          <div className="flex flex-wrap gap-2">
            {email.attachments.map((attachment, index) => (
              <Badge key={index} variant="secondary" className="cursor-pointer">
                <File className="h-4 w-4 mr-1" />
                {attachment.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
      <div className="p-4 mt-auto border-t">
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Reply className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" />
            <Share className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" />
            <Star className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" />
          </div>
          <Trash2 className="h-5 w-5 text-gray-500 cursor-pointer hover:text-red-500" />
        </div>
      </div>
    </Card>
  );
};

export default EmailPreviewPane;