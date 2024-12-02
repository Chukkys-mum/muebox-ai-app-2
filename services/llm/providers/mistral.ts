// /services/llm/providers/mistral.ts

import { LLMProvider } from '@/types/llm/provider';
import { MistralClient } from '@mistralai/mistralai';

export class MistralProvider implements LLMProvider {
  id = 'mistral';
  name = 'Mistral AI';
  description = 'Advanced language models optimized for efficiency';
  capabilities = ['text', 'code', 'analysis', 'embeddings'];
  private client: typeof MistralClient | null = null;

  async initialize(config: { apiKey: string }) {
    this.client = new MistralClient(config.apiKey);
  }

  async validate(apiKey: string): Promise<boolean> {
    try {
      const tempClient = new MistralClient(apiKey);
      await tempClient.chat({
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
    const response = await this.client.chat({
      model: params.model || 'mistral-medium',
      messages: [{ role: 'user', content: prompt }],
      temperature: params.temperature,
      top_p: params.topP,
      max_tokens: params.maxTokens
    });
    return response.choices[0].message.content;
  }

  async embed(text: string): Promise<number[]> {
    if (!this.client) throw new Error('Provider not initialized');
    const response = await this.client.embeddings({
      model: 'mistral-embed',
      input: [text]
    });
    return response.data[0].embedding;
  }
}