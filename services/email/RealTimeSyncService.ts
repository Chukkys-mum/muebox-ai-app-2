// /services/email/RealTimeSyncService.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EmailProviderFactory, ProviderType, EmailProvider } from './providers/ProviderFactory';
import { toast } from '@/components/ui/use-toast';
import { throttle, debounce } from 'lodash';
import { EmailMessage } from './providers/types';

interface SyncConfig {
  userId: string;
  syncInterval: number;
  maxRetries: number;
  batchSize: number;
  retryDelay: number;
}

interface Database {
    public: {
      Tables: {
        email_accounts: {
          Row: EmailAccount;
        };
        user_api_keys: {
          Row: UserApiKey;
        };
        emails: {
          Row: Email;
        };
      };
    };
  }

interface UserApiKey {
    user_id: string;
    llm_id: string;
    api_key: string;
    is_enabled: boolean;
  }
  
  interface Email {
    id: string;
    user_id: string;
    email_account_id: string;
    subject: string;
    sender: string;
    recipient: string;
    email_body: string;
    status: string;
    is_read: boolean;
  }
  
  interface EmailAccount {
    id: string;
    user_id: string;
    provider: string;
    email_address: string;
    status: string;
    created_at: string;
    updated_at: string;
  }

export class RealTimeSyncService {
  private supabase: SupabaseClient;
  private syncStatus: Map<string, boolean> = new Map();
  private offlineQueue: Map<string, EmailMessage[]> = new Map();
  private config: SyncConfig;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private retryAttempts: Map<string, number> = new Map();
  private syncTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<SyncConfig> = {}) {
    this.supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    this.config = {
      userId: '',
      syncInterval: 5 * 60 * 1000,
      maxRetries: 3,
      batchSize: 50,
      retryDelay: 5000,
      ...config
    };

    if (typeof window !== 'undefined') {
      this.setupNetworkHandlers();
    }
  }

  public async triggerAccountSync(accountId: string): Promise<void> {
    await this.syncAccount(accountId);
  }

  private setupNetworkHandlers() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private handleOnline = async () => {
    this.isOnline = true;
    console.log('Connection restored. Processing offline queue...');
    
    // Process queued updates
    for (const [accountId, messages] of this.offlineQueue.entries()) {
      await this.processOfflineQueue(accountId, messages);
    }
    this.offlineQueue.clear();

    // Restart sync for all accounts
    await this.restartSync();
  }

  private handleOffline = () => {
    this.isOnline = false;
    console.log('Connection lost. Queuing updates...');
  }

  private async processOfflineQueue(accountId: string, messages: EmailMessage[]) {
    try {
      const { data: account } = await this.supabase
        .from('email_accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (!account) return;

      const provider = EmailProviderFactory.getProvider(
        account.provider as ProviderType,
        {
          clientId: process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID!,
          clientSecret: process.env.GMAIL_CLIENT_SECRET!,
          redirectUri: `${window.location.origin}/auth/callback`,
          scopes: ['https://mail.google.com/']
        }
      );

      // Process messages in batches
      const batches = this.chunkArray(messages, this.config.batchSize);
      for (const batch of batches) {
        await this.processBatch(batch, accountId, provider);
      }
    } catch (error) {
      console.error('Failed to process offline queue:', error);
      // Keep failed messages in queue
      this.offlineQueue.set(accountId, messages);
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async startSync(userId: string) {
    this.config.userId = userId;

    // Set up real-time subscriptions
    this.setupRealtimeSubscriptions();

    // Initial sync for all accounts
    await this.syncAllAccounts();

    // Set up periodic sync
    this.setupPeriodicSync();
  }

  private setupRealtimeSubscriptions() {
    const channel = this.supabase
      .channel('email-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emails',
          filter: `user_id=eq.${this.config.userId}`
        },
        throttle(this.handleEmailChange, 1000)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_accounts',
          filter: `user_id=eq.${this.config.userId}`
        },
        this.handleAccountChange
      )
      .subscribe(this.handleSubscriptionChange);
  
    return () => {
      channel.unsubscribe();
    };
  }
  
  public subscribe(userId: string, callback: (payload: any) => void): () => void {
    this.config.userId = userId;
    const unsubscribe = this.setupRealtimeSubscriptions();
  
    // Wrap the existing handlers to also call the provided callback
    const originalHandleEmailChange = this.handleEmailChange;
    this.handleEmailChange = async (payload: any) => {
      await originalHandleEmailChange(payload);
      callback(payload);
    };
  
    const originalHandleAccountChange = this.handleAccountChange;
    this.handleAccountChange = async (payload: any) => {
      await originalHandleAccountChange(payload);
      callback(payload);
    };
  
    return () => {
      unsubscribe();
      // Reset the handlers
      this.handleEmailChange = originalHandleEmailChange;
      this.handleAccountChange = originalHandleAccountChange;
    };
  }

  private handleEmailChange = async (payload: any) => {
    if (!this.isOnline) {
      // Queue updates for when we're back online
      const accountId = payload.new.email_account_id;
      const messages = this.offlineQueue.get(accountId) || [];
      messages.push(payload.new);
      this.offlineQueue.set(accountId, messages);
      return;
    }

    // Process change and notify user
    await this.processEmailChange(payload);
  }

  private handleAccountChange = async (payload: any) => {
    if (payload.eventType === 'INSERT') {
      // New account added
      await this.syncAccount(payload.new.id);
    } else if (payload.eventType === 'DELETE') {
      // Account removed
      this.cleanupAccount(payload.old.id);
    }
  }

  private handleSubscriptionChange = (status: string) => {
    console.log(`Subscription status: ${status}`);
    // Removed the call to handleSubscriptionError
  }

  private async syncAccount(accountId: string, retryCount = 0) {
    if (this.syncStatus.get(accountId)) return;
    
    try {
      this.syncStatus.set(accountId, true);

      const { data: account, error } = await this.supabase
        .from('email_accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (error) throw error;
      if (!account) throw new Error('Account not found');

      // Fetch the access token from user_api_keys
      const { data: apiKey, error: apiKeyError } = await this.supabase
        .from('user_api_keys')
        .select('api_key')
        .eq('user_id', account.user_id)
        .eq('llm_id', account.provider)
        .single();

      if (apiKeyError) throw apiKeyError;
      if (!apiKey) throw new Error('API key not found');

      const { access_token } = JSON.parse(apiKey.api_key);

      const provider = EmailProviderFactory.getProvider(
        account.provider,
        {
          clientId: process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID!,
          clientSecret: process.env.GMAIL_CLIENT_SECRET!,
          redirectUri: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
          scopes: ['https://mail.google.com/']
        }
      );

      let pageToken: string | undefined;
      do {
        const result = await provider.getMessages(access_token, {
          pageSize: this.config.batchSize,
          pageToken,
          since: new Date(Date.now() - this.config.syncInterval)
        });

        await this.processBatch(result.messages, accountId, provider);
        pageToken = result.nextPageToken;
      } while (pageToken);

      this.retryAttempts.set(accountId, 0);

    } catch (error) {
      console.error(`Sync failed for account ${accountId}:`, error);
      
      if (retryCount < this.config.maxRetries) {
        const delay = this.config.retryDelay * Math.pow(2, retryCount);
        setTimeout(() => {
          this.syncAccount(accountId, retryCount + 1);
        }, delay);
      } else {
        toast({
          title: "Sync Error",
          description: `Failed to sync email account. Please check your connection.`,
          variant: "destructive",
        });
      }
    } finally {
      this.syncStatus.set(accountId, false);
    }
  }

  private async processBatch(
    messages: EmailMessage[], 
    accountId: string,
    provider: EmailProvider
  ) {
    const processMessage = debounce(async (message: EmailMessage) => {
      try {
        await this.supabase.from('emails').upsert({
          id: message.id,
          user_id: this.config.userId,
          email_account_id: accountId,
          subject: message.subject,
          sender: message.sender,
          recipient: message.recipients,
          email_body: message.body,
          status: 'analyzed',
          is_read: message.isRead
        });

        if (!message.isRead) {
          this.showNewEmailNotification(message);
        }
      } catch (error) {
        console.error('Failed to process message:', error);
      }
    }, 100);

    await Promise.all(messages.map(processMessage));
  }

  private showNewEmailNotification(message: EmailMessage) {
    // Browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('New Email', {
        body: `From: ${message.sender.name}\nSubject: ${message.subject}`,
      });
    }

    // In-app notification
    toast({
      title: "New Email",
      description: `From: ${message.sender.name}\nSubject: ${message.subject}`,
    });
  }

  private async processEmailChange(payload: any) {
    // Handle different types of changes
    switch (payload.eventType) {
      case 'INSERT':
        this.showNewEmailNotification(payload.new);
        break;
      case 'UPDATE':
        // Handle updates (e.g., mark as read)
        break;
      case 'DELETE':
        // Handle deletions
        break;
    }
  }

  private cleanupAccount(accountId: string) {
    // Clear any pending syncs
    clearTimeout(this.syncTimeouts.get(accountId));
    this.syncTimeouts.delete(accountId);
    this.syncStatus.delete(accountId);
    this.retryAttempts.delete(accountId);
    this.offlineQueue.delete(accountId);
  }

  private async syncAllAccounts() {
    const { data: accounts, error } = await this.supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', this.config.userId);

    if (error) {
      console.error('Failed to fetch accounts:', error);
      return;
    }

    await Promise.all(accounts.map(account => this.syncAccount(account.id)));
  }

  private setupPeriodicSync() {
    const setupAccountSync = async () => {
      const { data: accounts } = await this.supabase
        .from('email_accounts')
        .select('id')
        .eq('user_id', this.config.userId);
  
      if (!accounts) return;
  
      accounts.forEach((account) => {
        this.syncTimeouts.set(
          account.id,
          setInterval(() => this.syncAccount(account.id), this.config.syncInterval)
        );
      });
    };
  
    setupAccountSync();
  }

  private async restartSync() {
    // Clear existing timeouts
    this.syncTimeouts.forEach(timeout => clearTimeout(timeout));
    this.syncTimeouts.clear();

    // Restart sync for all accounts
    await this.syncAllAccounts();
    this.setupPeriodicSync();
  }

  async stop() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    
    this.syncTimeouts.forEach(timeout => clearTimeout(timeout));
    this.syncTimeouts.clear();
    
    // if (this.socket) {
    //   this.socket.close();
    //   this.socket = null;
    // }
  }
}

export const realTimeSyncService = new RealTimeSyncService();