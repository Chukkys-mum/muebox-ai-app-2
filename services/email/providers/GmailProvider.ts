// /services/email/providers/GmailProvider.ts

import { EmailProvider, EmailMessage, AuthTokens, EmailProviderConfig } from './types';
import { chunk } from 'lodash';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AIService } from '@/services/email/AIService';
import { EmailData } from '@/types';

export class GmailProvider extends EmailProvider {
  private baseUrl = 'https://gmail.googleapis.com/gmail/v1/users/me';
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
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<AuthTokens> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
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
    const response = await fetch('https://oauth2.googleapis.com/token', {
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
      refreshToken: refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000
    };
  }

  async getUserEmail(accessToken: string): Promise<string> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error('Failed to get user email');
    }

    const data = await response.json();
    return data.email;
  }

  async getMessages(accessToken: string, options: {
    pageSize?: number;
    pageToken?: string;
    since?: Date;
  } = {}): Promise<{ messages: EmailMessage[]; nextPageToken?: string }> {
    const params = new URLSearchParams({
      maxResults: String(options.pageSize || 50)
    });

    if (options.pageToken) {
      params.append('pageToken', options.pageToken);
    }

    if (options.since) {
      params.append('q', `after:${Math.floor(options.since.getTime() / 1000)}`);
    }

    const response = await fetch(`${this.baseUrl}/messages?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error('Failed to get messages');
    }

    const data = await response.json();
    
    const messages: EmailMessage[] = [];
    const chunks = chunk(data.messages, 10);
    
    for (const messageChunk of chunks) {
      const messagePromises = messageChunk.map((msg: any) => 
        this.getMessage(accessToken, msg.id)
      );
      messages.push(...await Promise.all(messagePromises));
    }

    return {
      messages,
      nextPageToken: data.nextPageToken
    };
  }

  async getMessage(accessToken: string, messageId: string): Promise<EmailMessage> {
    const response = await fetch(`${this.baseUrl}/messages/${messageId}?format=full`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error('Failed to get message');
    }

    const data = await response.json();
    return this.parseGmailMessage(data);
  }

  private parseGmailMessage(data: any): EmailMessage {
    const headers = new Map(data.payload.headers.map((h: any) => [h.name.toLowerCase(), h.value]));
    const attachments = [];
  
    if (data.payload.parts) {
      for (const part of data.payload.parts) {
        if (part.filename && part.body.attachmentId) {
          attachments.push({
            id: part.body.attachmentId,
            name: part.filename,
            contentType: part.mimeType,
            size: parseInt(part.body.size, 10)
          });
        }
      }
    }
  
    const getHeaderValue = (name: string): string => {
      const value = headers.get(name);
      return typeof value === 'string' ? value : '';
    };
  
    return {
      id: data.id,
      subject: getHeaderValue('subject') || '(no subject)',
      sender: this.parseEmailAddress(getHeaderValue('from')),
      recipients: {
        to: this.parseEmailList(getHeaderValue('to')),
        cc: this.parseEmailList(getHeaderValue('cc')),
        bcc: this.parseEmailList(getHeaderValue('bcc'))
      },
      body: data.snippet || '',
      isRead: !data.labelIds?.includes('UNREAD'),
      htmlBody: this.findHtmlBody(data.payload),
      attachments: attachments.length > 0 ? attachments : undefined,
      timestamp: new Date(parseInt(data.internalDate, 10)),
      labels: data.labelIds || [],
      unread: data.labelIds?.includes('UNREAD') || false
    };
  }

  private parseEmailAddress(header: string): { name: string; email: string } {
    if (!header) {
      return { name: '', email: '' };
    }
    const match = header.match(/^(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)$/);
    return {
      name: match?.[1] || '',
      email: match?.[2] || header
    };
  }
  
  private parseEmailList(header: string): string[] {
    if (!header) return [];
    return header.split(',').map(addr => this.parseEmailAddress(addr.trim()).email);
  }

  private findHtmlBody(payload: any): string | undefined {
    if (payload.mimeType === 'text/html') {
      return Buffer.from(payload.body.data, 'base64').toString();
    }
    if (payload.parts) {
      for (const part of payload.parts) {
        const html = this.findHtmlBody(part);
        if (html) return html;
      }
    }
    return undefined;
  }

  async getAttachment(accessToken: string, messageId: string, attachmentId: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/messages/${messageId}/attachments/${attachmentId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      throw new Error('Failed to get attachment');
    }

    const data = await response.json();
    const binaryData = Buffer.from(data.data, 'base64');
    return new Blob([binaryData], { type: data.mimeType });
  }

  async sendMessage(accessToken: string, message: Partial<EmailMessage>): Promise<string> {
    const mimeMessage = this.constructMimeMessage(message);
    const encodedMessage = Buffer.from(mimeMessage).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch(`${this.baseUrl}/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encodedMessage })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const data = await response.json();
    return data.id;
  }

  private constructMimeMessage(message: Partial<EmailMessage>): string {
    const headers = [
      `From: ${message.sender?.email || ''}`,
      `To: ${message.recipients?.to?.join(', ') || ''}`,
      `Subject: ${message.subject || ''}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8'
    ];

    if (message.recipients?.cc?.length) {
      headers.push(`Cc: ${message.recipients.cc.join(', ')}`);
    }

    return headers.join('\r\n') + '\r\n\r\n' + (message.htmlBody || message.body || '');
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
        timestamp: email.timestamp
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
}