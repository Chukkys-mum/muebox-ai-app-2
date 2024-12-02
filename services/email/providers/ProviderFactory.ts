// /services/email/providers/ProviderFactory.ts

import { EmailProvider, EmailProviderConfig } from './types';
import { GmailProvider } from './GmailProvider';
import { OutlookProvider } from './OutlookProvider';

export type ProviderType = 'gmail' | 'outlook';

export class EmailProviderFactory {
  private static providers = new Map<ProviderType, EmailProvider>();

  static getProvider(type: ProviderType, config: EmailProviderConfig): EmailProvider {
    if (!this.providers.has(type)) {
      let provider: EmailProvider;
      
      switch (type) {
        case 'gmail':
          provider = new GmailProvider(config);
          break;
        case 'outlook':
          provider = new OutlookProvider(config);
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