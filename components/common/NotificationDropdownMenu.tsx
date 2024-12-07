// File: components/notifications/NotificationsDropdown.tsx

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useRouter } from "next/navigation";
import NotificationItem, { Notification } from '@/components/common/NotificationItem';

interface NotificationsDropdownProps {
  notifications: Notification[];
  onMarkAllRead?: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  onMarkAllRead
}) => {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full text-white hover:bg-white/10">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 mr-4">
        <Card className="border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-foreground">Notifications</CardTitle>
              <Button variant="ghost" onClick={onMarkAllRead} className="text-xs font-normal">
                Mark all as read
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] px-2">
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  type="dropdownItem"
                  onMarkAsRead={onMarkAllRead}
                />
              ))}
            </ScrollArea>
          </CardContent>
          <CardFooter className="py-2 flex justify-center">
            <Button variant="link" className="text-sm font-medium" onClick={() => router.push('/dashboard/notifications')}>
              View all notifications
            </Button>
          </CardFooter>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
