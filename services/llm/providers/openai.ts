// /services/llm/providers/openai.ts

import { LLMProvider } from '@/types/llm/provider';
import OpenAI from 'openai';

export class OpenAIProvider implements LLMProvider {
  id = 'openai';
  name = 'OpenAI';
  description = 'GPT-4 and GPT-3.5 models with broad capabilities';
  capabilities = ['text', 'code', 'analysis', 'embeddings', 'functions'];
  
  private client: OpenAI | null = null;
  
  async initialize(config: { apiKey: string }) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
  }
  
  async validate(apiKey: string): Promise<boolean> {
    try {
      const tempClient = new OpenAI({ apiKey });
      await tempClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      });
      return true;
    } catch {
      return false;
    }
  }
  
  async complete(prompt: string, params: any): Promise<string> {
    if (!this.client) throw new Error('Provider not initialized');
    
    const response = await this.client.chat.completions.create({
      model: params.model || 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      top_p: params.topP,
      frequency_penalty: params.frequencyPenalty,
      presence_penalty: params.presencePenalty,
    });
    
    return response.choices[0].message.content || '';
  }

  async embed(text: string): Promise<number[]> {
    if (!this.client) throw new Error('Provider not initialized');
    
    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    
    return response.data[0].embedding;
  }
}
