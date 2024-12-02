// /services/llm/providers/anthropic.ts

import { LLMProvider } from '@/types/llm/provider';
import Anthropic from '@anthropic-ai/sdk';

export class AnthropicProvider implements LLMProvider {
  id = 'anthropic';
  name = 'Anthropic Claude';
  description = 'Advanced AI models with strong reasoning capabilities';
  capabilities = ['text', 'code', 'analysis', 'chat'];
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
      max_tokens: params.maxTokens || 1024,
      temperature: params.temperature || 0.7,
      messages: [{ role: 'user', content: prompt }]
    });
    
    const textContent = response.content[0];
    return textContent?.type === 'text' ? textContent.text : '';
  }

  async *stream(prompt: string, params: any): AsyncGenerator<string, any, any> {
    if (!this.client) throw new Error('Provider not initialized');
    const stream = await this.client.messages.create({
      model: params.model || 'claude-3-opus-20240229',
      max_tokens: params.maxTokens || 1024,
      temperature: params.temperature || 0.7,
      messages: [{ role: 'user', content: prompt }],
      stream: true
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        const delta = chunk.delta;
        if (delta.type === 'text_delta') {
          yield delta.text;
        }
      }
    }
  }
}