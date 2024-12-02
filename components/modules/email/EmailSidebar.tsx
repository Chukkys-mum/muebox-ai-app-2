// /components/modules/email/EmailSidebar.tsx

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import {
  Inbox,
  Send,
  ArchiveX,
  Trash2,
  Archive,
  Star,
  AlertCircle,
  File,
  Plus,
  Tag,
  Briefcase,
  User
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const mailboxItems = [
  {
    icon: Inbox,
    label: "Inbox",
    href: "/dashboard/email",
    count: 12
  },
  {
    icon: Star,
    label: "Starred",
    href: "/dashboard/email/starred"
  },
  {
    icon: Send,
    label: "Sent",
    href: "/dashboard/email/sent"
  },
  {
    icon: ArchiveX,
    label: "Draft",
    href: "/dashboard/email/draft",
    count: 2
  },
  {
    icon: Archive,
    label: "Archive",
    href: "/dashboard/email/archive"
  },
  {
    icon: AlertCircle,
    label: "Spam",
    href: "/dashboard/email/spam",
    count: 23
  },
  {
    icon: Trash2,
    label: "Trash",
    href: "/dashboard/email/trash"
  }
];

const labelItems = [
  {
    icon: AlertCircle,
    label: "Important",
    href: "/dashboard/email/label/important",
    color: "text-red-500"
  },
  {
    icon: User,
    label: "Personal",
    href: "/dashboard/email/label/personal",
    color: "text-blue-500"
  },
  {
    icon: Briefcase,
    label: "Work",
    href: "/dashboard/email/label/work",
    color: "text-green-500"
  }
];

interface EmailSidebarProps {
  className?: string;
  onClose?: () => void;
}

export function EmailSidebar({ className, onClose }: EmailSidebarProps) {
  const pathname = usePathname();

  const SidebarLink = ({ item }: { item: any }) => (
    <Button
      key={item.href}
      variant="ghost"
      className={cn(
        "w-full justify-start",
        pathname === item.href && "bg-muted",
        item.color
      )}
      asChild
      onClick={onClose}
    >
      <Link href={item.href}>
        <item.icon className="mr-2 h-4 w-4" />
        {item.label}
        {item.count && (
          <span className="ml-auto text-xs text-muted-foreground">
            {item.count}
          </span>
        )}
      </Link>
    </Button>
  );

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button 
              variant="secondary" 
              className="w-full justify-start" 
              asChild
              onClick={onClose}
            >
              <Link href="/dashboard/email/compose">
                <Plus className="mr-2 h-4 w-4" />
                Compose
              </Link>
            </Button>
          </div>
        </div>

        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Mailbox
          </h2>
          <div className="space-y-1">
            {mailboxItems.map((item) => (
              <SidebarLink key={item.href} item={item} />
            ))}
          </div>
        </div>

        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="px-4 text-lg font-semibold tracking-tight">
              Labels
            </h2>
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1">
            {labelItems.map((item) => (
              <SidebarLink key={item.href} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailSidebar;