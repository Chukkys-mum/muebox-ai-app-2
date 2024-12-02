import { useState } from "react";
import { Mail, Search, Star, StarOff, Paperclip, Tag } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/cn";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  },
  {
    id: "2",
    subject: "Project Deadline Extension",
    sender: {
      name: "Sarah Smith",
      email: "sarah@example.com"
    },
    preview: "Due to recent developments, we're extending the project deadline...",
    timestamp: new Date("2024-03-01T10:30:00"),
    read: true,
    flagged: false,
    attachments: false,
    labels: ["work"]
  },
  {
    id: "3",
    subject: "Client Meeting Notes",
    sender: {
      name: "Mike Johnson",
      email: "mike@example.com",
      avatar: "/api/placeholder/32/32"
    },
    preview: "Attached are the notes from our client meeting today...",
    timestamp: new Date("2024-03-01T14:15:00"),
    read: false,
    flagged: true,
    attachments: true,
    labels: ["client", "important"]
  }
];

const LABEL_COLORS: Record<string, string> = {
  work: "bg-blue-100 text-blue-800",
  important: "bg-red-100 text-red-800",
  client: "bg-green-100 text-green-800",
  personal: "bg-purple-100 text-purple-800"
};

export default function EmailInbox() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredEmails = emails
    .filter((email) => {
      const searchTerms = searchQuery.toLowerCase();
      return (
        email.subject.toLowerCase().includes(searchTerms) ||
        email.sender.name.toLowerCase().includes(searchTerms) ||
        email.sender.email.toLowerCase().includes(searchTerms) ||
        email.preview.toLowerCase().includes(searchTerms)
      );
    })
    .sort((a, b) => {
      const order = sortOrder === "asc" ? 1 : -1;
      return (b.timestamp.getTime() - a.timestamp.getTime()) * order;
    });

  const toggleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {filteredEmails.map((email) => (
            <div
              key={email.id}
              className={cn(
                "flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer relative group",
                !email.read && "bg-muted/30"
              )}
            >
              {/* Sender Avatar */}
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

              {/* Email Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {email.sender.name}
                    </p>
                    <p className="text-xs text-muted-foreground hidden sm:inline">
                      ({email.sender.email})
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(email.timestamp, { addSuffix: true })}
                  </p>
                </div>

                <h4 className={cn("text-sm mb-1", !email.read && "font-medium")}>
                  {email.subject}
                </h4>

                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-muted-foreground truncate">
                    {email.preview}
                  </p>
                </div>

                {/* Labels and Icons */}
                <div className="flex items-center gap-2 mt-2">
                  {email.labels?.map((label) => (
                    <Badge
                      key={label}
                      variant="secondary"
                      className={cn("text-xs", LABEL_COLORS[label])}
                    >
                      {label}
                    </Badge>
                  ))}
                  {email.attachments && (
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle flagged status
                  }}
                >
                  {email.flagged ? (
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Tag className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Add Label</DropdownMenuItem>
                    <DropdownMenuItem>Remove Label</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}