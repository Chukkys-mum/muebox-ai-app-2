// /services/llm/LLMManager.ts
// LLM Configuration implementation

// NEW FILE: /services/llm/LLMManager.ts

import { LLMConfig, LLMConfigManager } from '@/types/llm/config';
import { createClient } from '@/utils/supabase/server';

export class LLMManager implements LLMConfigManager {
  private configs: Map<string, LLMConfig>;
  private supabase;

  constructor() {
    this.configs = new Map();
    this.supabase = createClient();
    this.initialize();
  }

  private async initialize() {
    try {
      // Fetch configurations from database/storage
      const { data: llmConfigs, error } = await this.supabase
        .from('llm_configurations')
        .select('*');

      if (error) throw error;

      // Initialize configs map
      llmConfigs?.forEach(config => {
        this.configs.set(config.id, {
          ...config,
          isEnabled: true, // Default to enabled
          platformAPIKey: process.env[`NEXT_PUBLIC_${config.provider.toUpperCase()}_API_KEY`]
        });
      });
    } catch (error) {
      console.error('Failed to initialize LLM configurations:', error);
    }
  }

  public getAvailableLLMs(): LLMConfig[] {
    return Array.from(this.configs.values())
      .filter(config => config.isEnabled);
  }

  public getLLMById(id: string): LLMConfig | null {
    return this.configs.get(id) || null;
  }

  public async setUserAPIKey(llmId: string, apiKey: string): Promise<void> {
    const config = this.configs.get(llmId);
    if (!config) throw new Error(`LLM configuration not found for ID: ${llmId}`);

    try {
      // Store the API key securely
      const { error } = await this.supabase
        .from('user_api_keys')
        .upsert({
          llm_id: llmId,
          api_key: apiKey,
          // Add any additional fields like user_id, created_at, etc.
        });

      if (error) throw error;

      // Update local configuration
      this.configs.set(llmId, {
        ...config,
        userAPIKey: apiKey
      });
    } catch (error) {
      console.error(`Failed to set user API key for LLM ${llmId}:`, error);
      throw error;
    }
  }

  public async validateAPIKey(llmId: string, apiKey: string): Promise<boolean> {
    const config = this.configs.get(llmId);
    if (!config) throw new Error(`LLM configuration not found for ID: ${llmId}`);

    try {
      // Make a test request to the LLM's validation endpoint
      const response = await fetch(config.apiEndpoint + '/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error(`Failed to validate API key for LLM ${llmId}:`, error);
      return false;
    }
  }

  public async updateLLMConfig(llmId: string, updates: Partial<LLMConfig>): Promise<void> {
    const config = this.configs.get(llmId);
    if (!config) throw new Error(`LLM configuration not found for ID: ${llmId}`);

    try {
      // Update in database
      const { error } = await this.supabase
        .from('llm_configurations')
        .update(updates)
        .eq('id', llmId);

      if (error) throw error;

      // Update local configuration
      this.configs.set(llmId, {
        ...config,
        ...updates
      });
    } catch (error) {
      console.error(`Failed to update LLM configuration for ${llmId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const llmManager = new LLMManager();