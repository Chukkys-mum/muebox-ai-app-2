// /services/llm/providers/mistral.ts

import { LLMProvider } from '@/types/llm/provider';
import MistralAI from '@mistralai/mistralai';

export class MistralProvider implements LLMProvider {
    id = 'mistral';
    name = 'Mistral AI';
    description = 'Advanced language models optimized for efficiency';
    capabilities = ['text', 'code', 'analysis', 'embeddings'];
    private client: MistralAI.Mistral | null = null;
  
    async initialize(config: { apiKey: string }) {
      this.client = new MistralAI.Mistral({ apiKey: config.apiKey });
    }
  
    async validate(apiKey: string): Promise<boolean> {
      try {
        const tempClient = new MistralAI.Mistral({ apiKey });
        await tempClient.chat.complete({
          model: 'mistral-tiny',
          messages: [{ role: 'user', content: 'test' }]
        });
        return true;
      } catch {
        return false;
      }
    }
  
    async complete(prompt: string, params: any): Promise<string> {
        if (!this.client) throw new Error('Provider not initialized');
        const response = await this.client.chat.complete({
          model: params.model || 'mistral-medium',
          messages: [{ role: 'user', content: prompt }],
          temperature: params.temperature,
          topP: params.topP,
          maxTokens: params.maxTokens
        });
        const content = response.choices?.[0]?.message?.content;
        if (Array.isArray(content)) {
          // If content is an array of ContentChunk, join them into a string
          return content.map(chunk => chunk.toString()).join('');
        }
        return content ?? '';
      }
  
    async embed(text: string): Promise<number[]> {
      if (!this.client) throw new Error('Provider not initialized');
      const response = await this.client.embeddings.create({
        model: 'mistral-embed',
        inputs: [text]
      });
      return response.data[0]?.embedding ?? [];
    }
  }