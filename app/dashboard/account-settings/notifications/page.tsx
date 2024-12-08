'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import NotificationItem from '@/components/common/NotificationItem';
import type { Notification } from '@/components/common/NotificationItem';

// Create sample notifications matching the imported Notification interface
const sampleNotifications: Notification[] = [
  {
    id: '1',
    user_id: 'user123',
    title: 'New Message',
    message: 'You have a new message from John Doe',
    created_at: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read_at: null,
    notification_type: 'message'
  },
  {
    id: '2',
    user_id: 'user123',
    title: 'System Update',
    message: 'System maintenance scheduled for tonight',
    created_at: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    read_at: null,
    notification_type: 'system'
  },
  {
    id: '3',
    user_id: 'user123',
    title: 'New Feature',
    message: 'Check out our latest features',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read_at: new Date(), // already read
    notification_type: 'feature'
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read_at: notification.read_at || new Date()
    })));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id
        ? { ...notification, read_at: notification.read_at ? null : new Date() }
        : notification
    ));
  };

  return (
    <DashboardLayout
      title="Notifications"
      description="Stay up-to-date with the latest notifications in your application."
      user={null}
      products={[]}
      subscription={null}
      userDetails={null}
    >
      <div className="p-6">
        <Card className="p-6 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Notifications
            </h1>
            <Button onClick={markAllAsRead} variant="outline">
              Mark All as Read
            </Button>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            View recent notifications and updates.
          </p>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] px-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  type="pageItem"
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}