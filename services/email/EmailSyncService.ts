// services/EmailSyncService.ts

import { createClient } from '@/utils/supabase/server';
import { Database } from '@/types/types_db';

export class EmailSyncService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  private async refreshTokenIfNeeded(accountId: string): Promise<string> {
    const { data: tokenData, error: tokenError } = await this.supabase
      .from('user_api_keys')
      .select('api_key')
      .eq('id', accountId)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('Failed to retrieve tokens');
    }

    const tokens = JSON.parse(tokenData.api_key);
    if (Date.now() >= tokens.expires_at) {
      // Token has expired, refresh it
      const response = await fetch(
        tokens.provider === 'outlook'
          ? 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
          : 'https://oauth2.googleapis.com/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: tokens.provider === 'outlook'
              ? process.env.MICROSOFT_CLIENT_ID!
              : process.env.GOOGLE_CLIENT_ID!,
            client_secret: tokens.provider === 'outlook'
              ? process.env.MICROSOFT_CLIENT_SECRET!
              : process.env.GOOGLE_CLIENT_SECRET!,
            refresh_token: tokens.refresh_token,
            grant_type: 'refresh_token',
          }),
        }
      );

      const newTokens = await response.json();
      const updatedTokens = {
        ...tokens,
        access_token: newTokens.access_token,
        expires_at: Date.now() + newTokens.expires_in * 1000,
      };

      // Update stored tokens
      await this.supabase
        .from('user_api_keys')
        .update({ api_key: JSON.stringify(updatedTokens) })
        .eq('id', accountId);

      return newTokens.access_token;
    }

    return tokens.access_token;
  }

  async syncEmails(accountId: string, userId: string): Promise<void> {
    const { data: account, error: accountError } = await this.supabase
      .from('email_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      throw new Error('Email account not found');
    }

    const accessToken = await this.refreshTokenIfNeeded(accountId);

    // Fetch emails based on provider
    if (account.provider === 'gmail') {
      await this.syncGmailEmails(account.id, userId, accessToken);
    } else if (account.provider === 'outlook') {
      await this.syncOutlookEmails(account.id, userId, accessToken);
    }
  }

  private async syncGmailEmails(accountId: string, userId: string, accessToken: string): Promise<void> {
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=100',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    
    // Process each email
    for (const message of data.messages) {
      const emailResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const emailData = await emailResponse.json();
      
      // Extract email details
      const headers = emailData.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value;
      const sender = headers.find(h => h.name === 'From')?.value;
      const recipient = headers.find(h => h.name === 'To')?.value;

      // Store in database
      await this.supabase.from('emails').upsert({
        id: message.id,
        user_id: userId,
        email_account_id: accountId,
        subject,
        sender,
        recipient: { to: recipient },
        email_body: emailData.snippet,
        status: 'analyzed',
      });
    }
  }

  private async syncOutlookEmails(accountId: string, userId: string, accessToken: string): Promise<void> {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/messages?$top=100&$select=id,subject,from,toRecipients,bodyPreview',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    
    // Process each email
    for (const message of data.value) {
      // Store in database
      await this.supabase.from('emails').upsert({
        id: message.id,
        user_id: userId,
        email_account_id: accountId,
        subject: message.subject,
        sender: message.from.emailAddress.address,
        recipient: { to: message.toRecipients.map(r => r.emailAddress.address) },
        email_body: message.bodyPreview,
        status: 'analyzed',
      });
    }
  }

  async handleAttachments(emailId: string, accountId: string, messageId: string): Promise<void> {
    const { data: account, error: accountError } = await this.supabase
      .from('email_accounts')
      .select('provider')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      throw new Error('Email account not found');
    }

    const accessToken = await this.refreshTokenIfNeeded(accountId);
    
    if (account.provider === 'gmail') {
      await this.handleGmailAttachments(emailId, messageId, accessToken);
    } else if (account.provider === 'outlook') {
      await this.handleOutlookAttachments(emailId, messageId, accessToken);
    }
  }

  private async handleGmailAttachments(emailId: string, messageId: string, accessToken: string): Promise<void> {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    const parts = data.payload.parts || [];
    
    for (const part of parts) {
      if (part.filename && part.body.attachmentId) {
        // Get attachment content
        const attachmentResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${part.body.attachmentId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const attachmentData = await attachmentResponse.json();
        
        // Store attachment in Supabase Storage
        const fileName = `${emailId}/${part.filename}`;
        const { error: uploadError } = await this.supabase
          .storage
          .from('email-attachments')
          .upload(fileName, Buffer.from(attachmentData.data, 'base64'), {
            contentType: part.mimeType,
          });

        if (uploadError) {
          console.error('Failed to upload attachment:', uploadError);
          continue;
        }

        // Store attachment metadata in database
        await this.supabase.from('chat_files').insert({
          chat_id: emailId,
          file_type: part.mimeType,
          file_path: fileName,
          uploaded_by_id: 'system',
          status: 'active',
        });
      }
    }
  }

  private async handleOutlookAttachments(emailId: string, messageId: string, accessToken: string): Promise<void> {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/messages/${messageId}/attachments`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    
    for (const attachment of data.value) {
      if (attachment.contentBytes) {
        // Store attachment in Supabase Storage
        const fileName = `${emailId}/${attachment.name}`;
        const { error: uploadError } = await this.supabase
          .storage
          .from('email-attachments')
          .upload(fileName, Buffer.from(attachment.contentBytes, 'base64'), {
            contentType: attachment.contentType,
          });

        if (uploadError) {
          console.error('Failed to upload attachment:', uploadError);
          continue;
        }

        // Store attachment metadata in database
        await this.supabase.from('chat_files').insert({
          chat_id: emailId,
          file_type: attachment.contentType,
          file_path: fileName,
          uploaded_by_id: 'system',
          status: 'active',
        });
      }
    }
  }

  async setupRealTimeSync(userId: string): Promise<() => void> {
    // Subscribe to email changes
    const subscription = this.supabase
      .channel('email-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emails',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Email change received:', payload);
          // Trigger any UI updates through a callback or event system
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      subscription.unsubscribe();
    };
  }
}

export const emailSyncService = new EmailSyncService();