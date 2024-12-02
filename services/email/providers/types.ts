// /services/email/providers/types.ts

export interface EmailMessage {
    id: string;
    subject: string;
    sender: {
      name: string;
      email: string;
    };
    recipients: {
      to: string[];
      cc?: string[];
      bcc?: string[];
    };
    body: string;
    isRead: boolean;
    htmlBody?: string;
    attachments?: {
      id: string;
      name: string;
      contentType: string;
      size: number;
    }[];
    timestamp: Date;
    labels?: string[];
    unread: boolean;
  }
  
  export interface EmailProviderConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
  }
  
  export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  }
  
  export abstract class EmailProvider {
    protected config: EmailProviderConfig;
  
    constructor(config: EmailProviderConfig) {
      this.config = config;
    }
  
    abstract getAuthUrl(): string;
    abstract exchangeCodeForTokens(code: string): Promise<AuthTokens>;
    abstract refreshTokens(refreshToken: string): Promise<AuthTokens>;
    abstract getUserEmail(accessToken: string): Promise<string>;
    abstract getMessages(accessToken: string, options: {
      pageSize?: number;
      pageToken?: string;
      since?: Date;
    }): Promise<{
      messages: EmailMessage[];
      nextPageToken?: string;
    }>;
    abstract getMessage(accessToken: string, messageId: string): Promise<EmailMessage>;
    abstract getAttachment(accessToken: string, messageId: string, attachmentId: string): Promise<Blob>;
    abstract sendMessage(accessToken: string, message: Partial<EmailMessage>): Promise<string>;
  
    async syncEmails(account: any, userId: string, lastSyncTime?: Date): Promise<void> {
      const batchSize = 100; // Adjust as needed
      let pageToken: string | undefined;
      let syncedEmails = 0;
      
      do {
        const result = await this.getMessages(account.accessToken, {
          pageSize: batchSize,
          pageToken,
          since: lastSyncTime || new Date(0) // If no lastSyncTime, sync all emails
        });
  
        for (const message of result.messages) {
          await this.processAndStoreEmail(message, account.id, userId);
          syncedEmails++;
        }
  
        pageToken = result.nextPageToken;
  
        // Optional: Add a progress update here
        console.log(`Synced ${syncedEmails} emails so far...`);
  
      } while (pageToken);
  
      // Update last sync time
      await this.updateLastSyncTime(account.id, new Date());
  
      console.log(`Finished syncing ${syncedEmails} emails for account ${account.id}`);
    }
  
    protected abstract processAndStoreEmail(email: EmailMessage, accountId: string, userId: string): Promise<void>;
    protected abstract updateLastSyncTime(accountId: string, syncTime: Date): Promise<void>;
  }
  
  
  
  