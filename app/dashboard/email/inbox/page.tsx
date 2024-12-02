// app/dashboard/email/inbox/page.tsx

// app/dashboard/email/inbox/page.tsx

import { useState } from 'react';
import { Mail, Star, Archive, Trash, MoreHorizontal, ChevronLeft, ChevronRight, Paperclip } from 'lucide-react';

interface Email {
  id: number;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  read: boolean;
  starred: boolean;
  hasAttachments: boolean;
}

interface EmailRowProps {
  email: Email;
  selected: boolean;
  onClick: (email: Email) => void;
}

interface PreviewPaneProps {
  email: Email | null;
}

const EmailInbox = () => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  
  const emails: Email[] = [
    {
      id: 1,
      sender: "Alice Smith",
      subject: "Project Update - Q4 Review",
      preview: "I wanted to share the latest updates on our Q4 project milestones...",
      time: "10:30 AM",
      read: false,
      starred: true,
      hasAttachments: true
    },
    {
      id: 2,
      sender: "Bob Johnson",
      subject: "Meeting Notes - Team Sync",
      preview: "Here are the key points we discussed during today's sync meeting...",
      time: "9:15 AM",
      read: true,
      starred: false,
      hasAttachments: false
    }
  ];

  const Toolbar = () => (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-2">
        <input type="checkbox" className="rounded border-gray-300" />
        <div className="flex space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Archive className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Trash className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Star className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-500">1-50 of 234</span>
        <div className="flex space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );

  const EmailRow = ({ email, selected, onClick }: EmailRowProps) => (
    <div 
      className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer ${selected ? 'bg-blue-50' : ''} ${!email.read ? 'font-semibold' : ''}`}
      onClick={() => onClick(email)}
    >
      <div className="flex items-center space-x-4 w-full">
        <input type="checkbox" className="rounded border-gray-300" />
        <Star className={`w-4 h-4 ${email.starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <span className="truncate w-48">{email.sender}</span>
            <span className="text-sm text-gray-500">{email.time}</span>
          </div>
          <div className="text-sm">
            <div className="font-medium truncate">{email.subject}</div>
            <div className="text-gray-500 truncate">{email.preview}</div>
          </div>
        </div>
        {email.hasAttachments && (
          <Paperclip className="w-4 h-4 text-gray-400" />
        )}
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );

  const PreviewPane = ({ email }: PreviewPaneProps) => {
    if (!email) return null;
    
    return (
      <div className="border-l h-full p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">{email.subject}</h2>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {email.sender.charAt(0)}
              </span>
            </div>
            <div>
              <div className="font-medium">{email.sender}</div>
              <div className="text-sm text-gray-500">{email.time}</div>
            </div>
          </div>
        </div>
        <div className="prose max-w-none">
          <p>{email.preview}</p>
          {email.hasAttachments && (
            <div className="mt-6">
              <div className="text-sm font-medium text-gray-500 mb-2">
                Attachments
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm border">
                <Paperclip className="w-4 h-4 mr-2" />
                document.pdf
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r overflow-y-auto">
          {emails.map(email => (
            <EmailRow 
              key={email.id}
              email={email}
              selected={selectedEmail?.id === email.id}
              onClick={setSelectedEmail}
            />
          ))}
        </div>
        <div className="w-1/2 overflow-y-auto">
          <PreviewPane email={selectedEmail} />
        </div>
      </div>
    </div>
  );
};

export default EmailInbox;