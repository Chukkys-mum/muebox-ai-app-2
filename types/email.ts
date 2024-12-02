// types/email.ts

import { WithTimestamps, WithStatus, Status } from '@/types/types';
import { Json } from '@/types/types_db';

export type EmailStatus = 'pending' | 'analyzed' | 'deleted';

// Basic interfaces for email-related data
export interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  format: string;
  file_path?: string | null;
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

// Core email interface aligning with DB schema and UI needs
export interface EmailData extends WithTimestamps {
    id: string;
    user_id: string;
    email_account_id: string;
    subject: string | null;
    sender: string | null;
    recipient: Json | null;
    email_body: string | null;
    status: EmailStatus;
  }

// Enhanced Email interface for UI usage
export interface Email extends Omit<EmailData, 'sender' | 'recipient' | 'email_body'> {
  sender: EmailSender;
  recipients: EmailRecipient[];
  body: string;
  attachments?: EmailAttachment[];
  read_at?: string | null;
  starred?: boolean;
  labels?: string[];
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
    ...data,
    sender: {
      name: senderData?.name || 'Unknown',
      email: senderData?.email || '',
      avatar: senderData?.avatar
    },
    recipients: Array.isArray(recipientData) ? recipientData : [],
    body: data.email_body || '',
    attachments: [],  // Populate this based on your attachments data
    read_at: null,
    starred: false,
    labels: []
  };
};