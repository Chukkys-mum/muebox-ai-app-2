// types/email.ts

import { WithTimestamps, WithStatus, Status } from './common';
import { Json } from '@/types/types_db';

export type EmailStatus = 'pending' | 'analyzed' | 'deleted';

// Basic interfaces for email-related data
export interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  format: string;
  file_path?: string | null;
  type: string;
}

export interface Email {
  id: string;
  user_id: string;
  email_account_id: string;
  subject: string;
  sender: EmailSender;
  recipients: EmailRecipient[];
  body: string;
  status: EmailStatus;
  attachments?: EmailAttachment[];
  read_at?: string | null;
  starred?: boolean;
  labels?: string[];
  created_at: string;
  updated_at: string;
}

// Updated EmailAccount interface
export interface EmailAccount extends WithTimestamps, WithStatus {
  id: string;
  user_id: string;
  provider: string;
  email_address: string;
  sync_status?: 'syncing' | 'error' | 'success';
  last_sync?: string;
}

export interface EmailSender {
  id?: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface EmailRecipient {
  id?: string;
  name: string;
  email: string;
  type: 'to' | 'cc' | 'bcc';
}

// Core email interface aligning with DB schema and UI needs / // Database email interface
export interface EmailData extends WithTimestamps {
  id: string;
  user_id: string;
  email_account_id: string;
  subject: string | null;
  sender: string | null;
  recipient: Json | null;
  email_body: string | null;
  status: EmailStatus;
  created_at: string;
  updated_at: string;
}

// Interface for email analysis
export interface EmailAnalysis extends WithTimestamps, WithStatus {
  id: string;
  email_id: string;
  personality_id: string;
  tone_id: string;
  sentiment?: string | null;
  context?: string | null;
}

// Helper function to transform DB email data to UI Email interface
export const transformEmailData = (data: EmailData): Email => {
  const senderData = typeof data.sender === 'string' 
    ? JSON.parse(data.sender) 
    : data.sender;

  const recipientData = typeof data.recipient === 'string'
    ? JSON.parse(data.recipient)
    : data.recipient;

  return {
    id: data.id,
    user_id: data.user_id,
    email_account_id: data.email_account_id,
    subject: data.subject || '',
    sender: {
      name: senderData?.name || 'Unknown',
      email: senderData?.email || '',
      avatar: senderData?.avatar
    },
    recipients: Array.isArray(recipientData) ? recipientData : [],
    body: data.email_body || '',
    status: data.status,
    attachments: [],
    read_at: null,
    starred: false,
    labels: [],
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};