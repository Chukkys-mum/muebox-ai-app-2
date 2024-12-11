// /components/navbar/NotificationDropdownMenu/index.tsx
// Purpose: Displays and manages user notifications with real-time updates

'use client';

import { FC, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IconButton } from '../shared/IconButton';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  title: string;
  description?: string;
  type?: 'default' | 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read?: boolean;
}

interface NotificationDropdownMenuProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
}

const NotificationDropdownMenu: FC<NotificationDropdownMenuProps> = ({
  notifications = [],
  onMarkAllRead
}) => {
  const [unreadCount, setUnreadCount] = useState(
    notifications.filter(n => !n.read).length
  );

  const formatTimestamp = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <IconButton
            ariaLabel="Notifications"
            icon={<Bell className="h-5 w-5" />}
            badge={unreadCount}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[380px] p-0 bg-background"
        align="end"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onMarkAllRead();
                setUnreadCount(0);
              }}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          <DropdownMenuGroup>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-4 border-b last:border-0 ${
                    !notification.read ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{notification.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    {notification.description && (
                      <p className="text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No notifications
              </div>
            )}
          </DropdownMenuGroup>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdownMenu;