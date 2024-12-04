// /services/email/providers/ProviderFactory.ts

import { EmailProviderConfig, EmailMessage, AuthTokens } from './types';
import { GmailProvider } from './GmailProvider';
import { OutlookProvider } from './OutlookProvider';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AIService } from '@/services/email/AIService';

export type ProviderType = 'gmail' | 'outlook';

export interface EmailProvider {
  exchangeCodeForTokens(code: string): Promise<AuthTokens>;
  getUserEmail(accessToken: string): Promise<string>;
  getMessages(accessToken: string, options: {
    pageSize: number;
    pageToken?: string;
    since: Date;
  }): Promise<{
    messages: EmailMessage[];
    nextPageToken?: string;
  }>;
  syncEmails(account: any, userId: string): Promise<void>;
  getAuthUrl(): string;
}

export class EmailProviderFactory {
  private static providers = new Map<ProviderType, EmailProvider>();
  private static supabase: SupabaseClient;
  private static aiService: AIService;

  static initialize(supabaseUrl: string, supabaseKey: string, aiService: AIService) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.aiService = aiService;
  }

  static getProvider(type: ProviderType, config: EmailProviderConfig): EmailProvider {
    if (!this.supabase || !this.aiService) {
      throw new Error('EmailProviderFactory has not been initialized');
    }

    if (!this.providers.has(type)) {
      let provider: EmailProvider;
      
      switch (type) {
        case 'gmail':
          provider = new GmailProvider(config, this.supabase, this.aiService);
          break;
        case 'outlook':
          provider = new OutlookProvider(config, this.supabase, this.aiService);
          break;
        default:
          throw new Error(`Unsupported provider type: ${type}`);
      }
      
      this.providers.set(type, provider);
    }
    
    return this.providers.get(type)!;
  }

  static clearProviders(): void {
    this.providers.clear();
  }
}

export const createEmailProvider = (
  type: ProviderType,
  config: EmailProviderConfig
): EmailProvider => {
  return EmailProviderFactory.getProvider(type, config);
};