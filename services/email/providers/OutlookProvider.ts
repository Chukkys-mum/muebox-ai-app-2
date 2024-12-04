// /services/email/providers/OutlookProvider.ts

import { EmailProvider, EmailMessage, AuthTokens, EmailProviderConfig } from './types';
import { SupabaseClient } from '@supabase/supabase-js';
import { AIService } from '@/services/email/AIService';
import { EmailData } from '@/types';

export class OutlookProvider extends EmailProvider {
  private baseUrl = 'https://graph.microsoft.com/v1.0/me';
  private supabase: SupabaseClient;
  private aiService: AIService;

  constructor(
    config: EmailProviderConfig,
    supabase: SupabaseClient,
    aiService: AIService
  ) {
    super(config);
    this.supabase = supabase;
    this.aiService = aiService;
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      response_mode: 'query'
    });

    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
  }

  async syncEmails(account: any, userId: string): Promise<void> {
    console.log(`Syncing emails for account ${account.id} of user ${userId}`);
    
    let pageToken: string | undefined;
    const batchSize = 50; // Adjust as needed
    const syncStartTime = new Date();

    do {
      const result = await this.getMessages(account.accessToken, {
        pageSize: batchSize,
        pageToken,
        since: new Date(account.last_synced_at) // Assuming last_synced_at is stored in the account
      });

      for (const message of result.messages) {
        await this.processAndStoreEmail(message, account.id, userId);
      }

      pageToken = result.nextPageToken;
    } while (pageToken);

    await this.updateLastSyncTime(account.id, syncStartTime);
  }

  protected async processAndStoreEmail(email: EmailMessage, accountId: string, userId: string): Promise<void> {
    try {
      await this.supabase.from('emails').upsert({
        id: email.id,
        account_id: accountId,
        user_id: userId,
        subject: email.subject,
        body: email.body,
        sender: JSON.stringify(email.sender),
        recipient: JSON.stringify(email.recipients),
        timestamp: email.timestamp,
        html_body: email.htmlBody,
        is_read: email.isRead,
        labels: email.labels,
        unread: email.unread
      });
  
      const emailData: EmailData = {
        id: email.id,
        user_id: userId,
        email_account_id: accountId,
        subject: email.subject,
        sender: JSON.stringify(email.sender),
        recipient: email.recipients,
        email_body: email.body,
        status: 'pending',
        created_at: email.timestamp.toISOString(),
        updated_at: new Date().toISOString()
      };
  
      await this.aiService.processEmailForTraining(emailData, userId);
    } catch (error) {
      console.error('Failed to process and store email:', error);
      throw error;
    }
  }

  protected async updateLastSyncTime(accountId: string, syncTime: Date): Promise<void> {
    try {
      await this.supabase
        .from('email_accounts')
        .update({ last_synced_at: syncTime.toISOString() })
        .eq('id', accountId);
    } catch (error) {
      console.error('Failed to update last sync time:', error);
      throw error;
    }
  }

  async exchangeCodeForTokens(code: string): Promise<AuthTokens> {
    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        grant_type: 'authorization_code',
        code
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh tokens');
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000
    };
  }

  async getUserEmail(accessToken: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error('Failed to get user email');
    }

    const data = await response.json();
    return data.userPrincipalName;
  }

  async getMessages(accessToken: string, options: {
    pageSize?: number;
    pageToken?: string;
    since?: Date;
  } = {}): Promise<{ messages: EmailMessage[]; nextPageToken?: string }> {
    let url = `${this.baseUrl}/messages?$top=${options.pageSize || 50}`;
    
    if (options.since) {
      url += `&$filter=receivedDateTime ge ${options.since.toISOString()}`;
    }
    if (options.pageToken) {
      url = options.pageToken; // Microsoft uses full URLs for pagination
    }

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error('Failed to get messages');
    }

    const data = await response.json();
    
    return {
      messages: data.value.map(this.parseOutlookMessage),
      nextPageToken: data['@odata.nextLink']
    };
  }

  // /services/email/providers/OutlookProvider.ts

  async getMessage(accessToken: string, messageId: string): Promise<EmailMessage> {
    const response = await fetch(
      `${this.baseUrl}/messages/${messageId}?$expand=attachments`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      throw new Error('Failed to get message');
    }

    const data = await response.json();
    return this.parseOutlookMessage(data);
  }

  private parseOutlookMessage(data: any): EmailMessage {
    const attachments = data.attachments?.map((attachment: any) => ({
      id: attachment.id,
      name: attachment.name,
      contentType: attachment.contentType,
      size: attachment.size
    }));
  
    return {
      id: data.id,
      subject: data.subject || '(no subject)',
      sender: {
        name: data.from?.emailAddress?.name || '',
        email: data.from?.emailAddress?.address || ''
      },
      recipients: {
        to: data.toRecipients?.map((r: any) => r.emailAddress.address) || [],
        cc: data.ccRecipients?.map((r: any) => r.emailAddress.address) || [],
        bcc: data.bccRecipients?.map((r: any) => r.emailAddress.address) || []
      },
      body: data.bodyPreview || '',
      isRead: !data.isRead,
      htmlBody: data.body?.content,
      attachments: attachments?.length ? attachments : undefined,
      timestamp: new Date(data.receivedDateTime),
      labels: this.getOutlookCategories(data.categories),
      unread: data.isRead === false
    };
  }
  

  private getOutlookCategories(categories: string[] | undefined): string[] {
    if (!categories) return [];
    // Map Outlook categories to standardized labels if needed
    return categories.map(category => category.toLowerCase());
  }

  async getAttachment(accessToken: string, messageId: string, attachmentId: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/messages/${messageId}/attachments/${attachmentId}/$value`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      throw new Error('Failed to get attachment');
    }

    return await response.blob();
  }

  async sendMessage(accessToken: string, message: Partial<EmailMessage>): Promise<string> {
    const outlookMessage = {
      subject: message.subject,
      body: {
        contentType: 'HTML',
        content: message.htmlBody || message.body
      },
      toRecipients: message.recipients?.to.map(email => ({
        emailAddress: { address: email }
      })),
      ccRecipients: message.recipients?.cc?.map(email => ({
        emailAddress: { address: email }
      })),
      bccRecipients: message.recipients?.bcc?.map(email => ({
        emailAddress: { address: email }
      }))
    };

    const response = await fetch(`${this.baseUrl}/sendMail`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: outlookMessage })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    // Microsoft Graph API doesn't return message ID when sending
    // We need to query the sent items folder to get the message ID
    const sentMessage = await fetch(
      `${this.baseUrl}/messages?$filter=subject eq '${message.subject}'&$orderby=sentDateTime desc&$top=1`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!sentMessage.ok) {
      throw new Error('Message sent but failed to retrieve message ID');
    }

    const data = await sentMessage.json();
    return data.value[0]?.id || 'message-sent';
  }

  private async uploadAttachment(
    accessToken: string, 
    messageId: string, 
    attachment: { name: string; content: string; contentType: string }
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/messages/${messageId}/attachments`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: attachment.name,
          contentBytes: attachment.content,
          contentType: attachment.contentType
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload attachment');
    }
  }
}