// /components/modules/email/EmailList.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import InboxToolbar from "@/components/modules/email/InboxToolbar";
import { useEmailPagination } from "@/hooks/useEmailPagination";
import { useEmailRefresh } from "@/hooks/useEmailRefresh";
import { useEmail } from "@/context/EmailContext";
import { Email } from "@/types/email";
import { cn } from "@/utils/cn";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Star,
  Paperclip
} from "lucide-react";

interface EmailListProps {
  initialEmails: Email[];
  totalEmails: number;
}

export default function EmailList({ initialEmails, totalEmails }: EmailListProps) {
  const router = useRouter();
  const { selectedEmails, selectEmails } = useEmail();
  const setSelectedEmails = (emails: Set<string>) => selectEmails(emails);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const { 
    emails, 
    loading: paginationLoading,
    error: paginationError
  } = useEmailPagination(initialEmails);

  const { 
    refresh, 
    lastRefreshed,
    refreshing  
  } = useEmailRefresh();

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

  const handleEmailClick = (email: Email) => {
    router.push(`/dashboard/email/${email.id}`);
  };

  return (
    <div className="flex flex-col h-full">
      <InboxToolbar 
        selectedCount={selectedEmails.size}
        totalEmails={totalEmails}
        currentPage={currentPage}
        totalPages={Math.ceil(totalEmails / pageSize)}
        onSelectAll={handleSelectAll}
        onRefresh={refresh}
        onPreviousPage={() => setCurrentPage(p => Math.max(1, p - 1))}
        onNextPage={() => setCurrentPage(p => p + 1)}
        onArchive={() => console.log('Archive')}
        onDelete={() => console.log('Delete')}
        onStar={() => console.log('Star')}
        onTag={() => console.log('Tag')}
      />

      {/* Loading State */}
      {(paginationLoading || refreshing) && (
        <div className="flex justify-center p-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {/* Error State */}
      {paginationError && (
        <div className="text-destructive text-center p-4">
          Failed to load emails. Please try again.
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
            onClick={() => handleEmailClick(email)}
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
  onClick: () => void;
}

function EmailRow({ email, selected, onSelect, onClick }: EmailRowProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-4 p-4 border-b hover:bg-muted/50 cursor-pointer",
        !email.read_at && "font-medium",  
        selected && "bg-muted"
    )}
      onClick={onClick}
    >
      <Checkbox 
        checked={selected}
        onCheckedChange={onSelect}
        onClick={(e) => e.stopPropagation()}
      />
      <Button 
        variant="ghost" 
        size="icon"
        className="text-muted-foreground"
        onClick={(e) => {
          e.stopPropagation();
          // TODO: Implement star functionality
        }}
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
          {email.body}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {email.attachments && email.attachments.length > 0 && (
          <Paperclip className="h-4 w-4 text-muted-foreground" />
        )}
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {format(new Date(email.read_at || email.created_at), 'MMM d')}   
        </div>
      </div>
    </div>
  );
}