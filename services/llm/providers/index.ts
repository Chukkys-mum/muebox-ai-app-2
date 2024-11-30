// /services/llm/providers/index.ts

import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { GoogleAIProvider } from './google';
import { MistralProvider } from './mistral';
import { LLMProvider } from '@/types/llm/provider';

export const llmProviders: Record<string, LLMProvider> = {
  'openai': new OpenAIProvider(),
  'anthropic': new AnthropicProvider(),
  'google': new GoogleAIProvider(),
  'mistral': new MistralProvider()
};

// /types/llm/provider.ts

export interface LLMProvider {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  
  initialize(config: any): Promise<void>;
  validate(apiKey: string): Promise<boolean>;
  complete(prompt: string, params: any): Promise<string>;
  
  // Optional methods for specific capabilities
  stream?(prompt: string, params: any): AsyncGenerator<string>;
  embed?(text: string): Promise<number[]>;
  tokenize?(text: string): Promise<string[]>;
}

// Example implementation:
// /services/llm/providers/anthropic.ts

import { LLMProvider } from '@/types/llm/provider';
import Anthropic from '@anthropic-ai/sdk';

export class AnthropicProvider implements LLMProvider {
  id = 'anthropic';
  name = 'Anthropic Claude';
  description = 'Advanced AI model with strong reasoning capabilities';
  capabilities = ['text', 'code', 'analysis'];
  
  private client: Anthropic | null = null;
  
  async initialize(config: { apiKey: string }) {
    this.client = new Anthropic({
      apiKey: config.apiKey
    });
  }
  
  async validate(apiKey: string): Promise<boolean> {
    try {
      const tempClient = new Anthropic({ apiKey });
      await tempClient.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }]
      });
      return true;
    } catch {
      return false;
    }
  }
  
  async complete(prompt: string, params: any): Promise<string> {
    if (!this.client) throw new Error('Provider not initialized');
    
    const response = await this.client.messages.create({
      model: params.model || 'claude-3-opus-20240229',
      max_tokens: params.maxTokens,
      messages: [{ role: 'user', content: prompt }]
    });
    
    return response.content[0].text;
  }
}