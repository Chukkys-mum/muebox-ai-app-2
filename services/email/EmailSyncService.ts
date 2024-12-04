// /services/email/EmailSyncService.ts

import { createClient } from '@/utils/supabase/server';
import { EmailProviderFactory, ProviderType } from './providers/ProviderFactory';
import { realTimeSyncService } from './RealTimeSyncService';
import { toast } from '@/components/ui/use-toast';
import { revalidatePath } from 'next/cache';
import cron from 'node-cron';

type SyncFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';

interface EmailAccount {
  id: string;
  user_id: string;
  provider: string;
  email_address: string;
  status: string;
  created_at: string;
  updated_at: string;
  sync_frequency?: SyncFrequency;
  last_sync?: string;
}

export class EmailSyncService {
  private supabase;
  private schedules: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.supabase = createClient();
  }

  private async getEmailAccounts(userId: string): Promise<EmailAccount[]> {
    const { data: accounts, error } = await this.supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return accounts;
  }

  setupEmailSync = async (userId: string) => {
    try {
      await realTimeSyncService.startSync(userId);

      const accounts = await this.getEmailAccounts(userId);

      for (const account of accounts) {
        await this.syncEmails(account.id, userId);
        if (account.sync_frequency) {
          await this.setupSyncSchedule(account.id, userId, account.sync_frequency);
        }
      }

      revalidatePath('/dashboard');
    } catch (error) {
      console.error('Email sync setup failed:', error);
      toast({
        title: "Sync Setup Failed",
        description: "Failed to set up email synchronization",
        variant: "destructive"
      });
    }
  }

  syncAllAccounts = async (userId: string): Promise<void> => {
    try {
      const { data: accounts } = await this.supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', userId);
  
      if (!accounts) return;
  
      await Promise.all(
        accounts.map(account => this.syncEmails(account.id, userId))
      );
  
    } catch (error) {
      console.error('Failed to sync all accounts:', error);
      throw error;
    }
  };

  syncEmails = async (accountId: string, userId: string): Promise<void> => {
    const account = await this.getEmailAccount(accountId);

    if (!account) {
      throw new Error('Email account not found');
    }

    const provider = EmailProviderFactory.getProvider(
      account.provider as ProviderType,
      this.getProviderConfig(account.provider as ProviderType)
    );

    await provider.syncEmails(account, userId);
    revalidatePath(`/emails/${accountId}`); // Revalidate the specific email account page
  }

  setupSyncSchedule = async (accountId: string, userId: string, frequency: SyncFrequency) => {
    this.cancelSyncSchedule(accountId);

    let cronExpression: string;
    switch (frequency) {
      case 'hourly': cronExpression = '0 * * * *'; break;
      case 'daily': cronExpression = '0 0 * * *'; break;
      case 'weekly': cronExpression = '0 0 * * 0'; break;
      case 'monthly': cronExpression = '0 0 1 * *'; break;
      case 'quarterly': cronExpression = '0 0 1 */3 *'; break;
      case 'annually': cronExpression = '0 0 1 1 *'; break;
      default: throw new Error('Invalid frequency');
    }

    const task = cron.schedule(cronExpression, () => {
      this.syncEmails(accountId, userId);
    });

    this.schedules.set(accountId, task);
  }

  cancelSyncSchedule(accountId: string) {
    const existingSchedule = this.schedules.get(accountId);
    if (existingSchedule) {
      existingSchedule.stop();
      this.schedules.delete(accountId);
    }
  }

  private async getEmailAccount(accountId: string) {
    const { data: account, error } = await this.supabase
      .from('email_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error) throw error;
    return account;
  }

  private getProviderConfig(provider: ProviderType) {
    switch (provider) {
      case 'gmail':
        return {
          clientId: process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID!,
          clientSecret: process.env.GMAIL_CLIENT_SECRET!,
          redirectUri: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
          scopes: ['https://mail.google.com/']
        };
      // Add other provider configurations here
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  updateSyncFrequency = async (accountId: string, userId: string, frequency: SyncFrequency) => {
    await this.supabase
      .from('email_accounts')
      .update({ 
        sync_frequency: frequency 
      } as Partial<EmailAccount>) // Type assertion here
      .eq('id', accountId);
  
    await this.setupSyncSchedule(accountId, userId, frequency);
  }

  cleanup = async () => {
    await realTimeSyncService.stop();
    this.schedules.forEach(schedule => schedule.stop());
    this.schedules.clear();
  }
}

// Create a singleton instance
export const emailSyncService = new EmailSyncService();

// Server Action for setting up email sync
export async function setupEmailSyncAction(userId: string) {
  'use server';
  await emailSyncService.setupEmailSync(userId);
}

// Server Action for cleaning up email sync
export async function cleanupEmailSyncAction() {
  'use server';
  await emailSyncService.cleanup();
}

// Server Action for updating sync frequency
export async function updateSyncFrequencyAction(accountId: string, userId: string, frequency: SyncFrequency) {
  'use server';
  await emailSyncService.updateSyncFrequency(accountId, userId, frequency);
}