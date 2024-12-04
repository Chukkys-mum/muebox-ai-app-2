// types/notification.ts

import { WithTimestamps, WithStatus } from './common';

// Notification interface
export interface Notification extends WithTimestamps, WithStatus {
  id: string;
  user_id: string;
  notification_type: string;
  message?: string;
  read_at?: string;
}

// You can add more notification-related types or interfaces here as needed

// For example, you might want to add types for different notification types:

export type NotificationType = 
  | 'message'
  | 'mention'
  | 'task_assigned'
  | 'task_completed'
  | 'file_shared'
  | 'comment'
  | 'system_alert';

// Notification Preference interface
export interface NotificationPreference {
  user_id: string;
  notification_type: NotificationType;
  email: boolean;
  push: boolean;
  in_app: boolean;
}

// Notification Settings interface
export interface NotificationSettings {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  do_not_disturb: {
    enabled: boolean;
    start_time?: string; // e.g., "22:00"
    end_time?: string; // e.g., "08:00"
  };
}

// Notification Payload interface
export interface NotificationPayload {
  type: NotificationType;
  message: string;
  data?: Record<string, any>;
}

// Notification Response interface
export interface NotificationResponse {
  success: boolean;
  message?: string;
  notification?: Notification;
}

// Notification Query interface
export interface NotificationQuery {
  user_id: string;
  read?: boolean;
  type?: NotificationType;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

// Notification Stats interface
export interface NotificationStats {
  user_id: string;
  total_count: number;
  unread_count: number;
  last_read_at?: string;
}