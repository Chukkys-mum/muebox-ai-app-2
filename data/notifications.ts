// File: data/notifications.ts

// Use relative path from the data folder, pointing directly into `public/img`
import team30 from '../../public/img/phoenix/team/40x40/30.webp';
import team57 from '../../public/img/phoenix/team/40x40/57.webp';
import team59 from '../../public/img/phoenix/team/40x40/59.webp';
import team58 from '../../public/img/phoenix/team/40x40/58.webp';
import team60 from '../../public/img/phoenix/team/40x40/60.webp';
import team34 from '../../public/img/phoenix/team/40x40/34.webp';


import { StaticImageData } from 'next/image';

export interface Notification {
  id: string;
  user_id: string;
  notification_type?: string;
  message: string;
  status: string;
  created_at: Date;
  read_at?: Date | null;
  avatar?: string | StaticImageData;
  name: string;
  detail?: string;
  interaction: string;
  interactionIcon: string;
  ago: string;
  icon: string;
  time: string;
  date: string;
  // Add missing properties
  title?: string;
  read?: boolean;
}

export const notifications: Notification[] = [
  {
    id: '1',
    user_id: 'user123',
    notification_type: 'comment',
    message: 'You have a new comment',
    status: 'unread',
    created_at: new Date('2021-08-07T10:41:00'),
    read_at: new Date('2021-08-07T10:51:00'),
    avatar: team30, // Updated to use StaticImageData
    name: 'Jessie Samson',
    interactionIcon: '💬',
    interaction: 'Mentioned you in a comment.',
    detail: '"Well done! Proud of you ❤️"',
    ago: '10m',
    icon: 'clock',
    time: '10:41 AM',
    date: 'August 7, 2021'
  },
  {
    id: '2',
    user_id: 'user456',
    notification_type: 'event',
    message: 'New event created',
    status: 'unread',
    created_at: new Date('2021-08-07T10:20:00'),
    read_at: null,
    avatar: team58, // Updated to use StaticImageData
    name: 'Jane Foster',
    interactionIcon: '📅',
    interaction: 'Created an event.',
    detail: 'Rome holidays',
    ago: '20m',
    icon: 'clock',
    time: '10:20 AM',
    date: 'August 7, 2021'
  },
  {
    id: '3',
    user_id: 'user789',
    notification_type: 'like',
    message: 'Your comment received a like',
    status: 'unread',
    created_at: new Date('2021-08-07T09:30:00'),
    read_at: null,
    avatar: team59,
    name: 'Jessie Samson',
    interactionIcon: '👍',
    interaction: 'Liked your comment.',
    detail: '"Amazing Work!"',
    ago: '1h',
    icon: 'clock',
    time: '9:30 AM',
    date: 'August 7, 2021'
  },
  // Add other notifications here
];
