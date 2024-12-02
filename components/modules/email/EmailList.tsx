// /components/modules/email/EmailList.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Star,
  Tags,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";

interface Email {
  id: string;
  subject: string;
  sender: {
    name: string;
    email: string;
    avatar?: string;
  };
  excerpt: string;
  timestamp: Date;
  read: boolean;
  starred: boolean;
  attachments?: {
    name: string;
    size: string;
    type: string;
  }[];
}

interface EmailListProps {
  emails: Email[];
}

export default function EmailList({ emails }: EmailListProps) {
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmails(new Set(emails.map(email => email.id)));
    } else {
      setSelectedEmails(new Set());
    }
  };

  const handleSelectEmail = (emailId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmails);
    if (checked) {
      newSelected.add(emailId);
    } else {
      newSelected.delete(emailId);
    }
    setSelectedEmails(newSelected);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="border-b p-2 flex items-center justify-between sticky top-0 bg-background z-10">
        <div className="flex items-center gap-2">
          <Checkbox 
            checked={selectedEmails.size === emails.length}
            onCheckedChange={handleSelectAll}
          />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <div className="text-sm text-muted-foreground">
            Last refreshed {format(new Date(), 'h:mm a')}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>1-50 of 234</span>
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Action bar */}
      {selectedEmails.size > 0 && (
        <div className="border-b p-2 flex items-center gap-2 bg-muted/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Archive className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Tags className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Label</TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Email list */}
      <div className="flex-1 overflow-auto">
        {emails.map((email) => (
          <EmailRow
            key={email.id}
            email={email}
            selected={selectedEmails.has(email.id)}
            onSelect={(checked) => handleSelectEmail(email.id, checked)}
          />
        ))}
      </div>
    </div>
  );
}

interface EmailRowProps {
  email: Email;
  selected: boolean;
  onSelect: (checked: boolean) => void;
}

function EmailRow({ email, selected, onSelect }: EmailRowProps) {
  return (
    <div className={cn(
      "flex items-center gap-4 p-4 border-b hover:bg-muted/50 cursor-pointer",
      !email.read && "font-medium",
      selected && "bg-muted"
    )}>
      <Checkbox 
        checked={selected}
        onCheckedChange={onSelect}
        onClick={(e) => e.stopPropagation()}
      />
      <Button 
        variant="ghost" 
        size="icon"
        className="text-muted-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <Star className={cn(
          "h-4 w-4",
          email.starred && "fill-yellow-400 text-yellow-400"
        )} />
      </Button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{email.sender.name}</span>
          <span className="text-sm text-muted-foreground truncate">
            {email.subject}
          </span>
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {email.excerpt}
        </div>
      </div>
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        {format(email.timestamp, 'MMM d')}
      </div>
    </div>
  );
}