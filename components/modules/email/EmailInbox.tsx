// /components/modules/email/EmailInbox.tsx

import { Mail } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/cn";
import { formatDistanceToNow } from "date-fns";

interface Email {
  id: string;
  subject: string;
  sender: {
    name: string;
    email: string;
    avatar?: string;
  };
  preview: string;
  timestamp: Date;
  read: boolean;
  flagged: boolean;
  attachments: boolean;
  labels?: string[];
}

const emails: Email[] = [
  {
    id: "1",
    subject: "Weekly Team Update",
    sender: {
      name: "John Doe",
      email: "john@example.com",
      avatar: "/api/placeholder/32/32"
    },
    preview: "Here's a summary of what we accomplished this week...",
    timestamp: new Date("2024-03-01T09:00:00"),
    read: false,
    flagged: true,
    attachments: true,
    labels: ["work", "important"]
  }
  // Add more sample emails as needed
];

export default function EmailInbox() {
  return (
    <ScrollArea className="h-screen">
      <div className="divide-y">
        {emails.map((email) => (
          <div
            key={email.id}
            className={cn(
              "flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer",
              !email.read && "bg-muted/30 font-medium"
            )}
          >
            <div className="flex-shrink-0">
              {email.sender.avatar ? (
                <img
                  src={email.sender.avatar}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm truncate">{email.sender.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(email.timestamp, { addSuffix: true })}
                </p>
              </div>
              <h4 className={cn("text-sm", !email.read && "font-medium")}>
                {email.subject}
              </h4>
              <p className="text-sm text-muted-foreground truncate">
                {email.preview}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}