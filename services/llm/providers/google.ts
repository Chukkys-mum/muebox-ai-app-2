// /services/llm/providers/google.ts

import { LLMProvider } from '@/types/llm/provider';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GoogleAIProvider implements LLMProvider {
  id = 'google';
  name = 'Google AI';
  description = 'Gemini models for text and multimodal tasks';
  capabilities = ['text', 'code', 'analysis', 'vision'];
  
  private client: GoogleGenerativeAI | null = null;
  
  async initialize(config: { apiKey: string }) {
    this.client = new GoogleGenerativeAI(config.apiKey);
  }
  
  async validate(apiKey: string): Promise<boolean> {
    try {
      const tempClient = new GoogleGenerativeAI(apiKey);
      const model = tempClient.getGenerativeModel({ model: 'gemini-pro' });
      await model.generateContent('test');
      return true;
    } catch {
      return false;
    }
  }
  
  async complete(prompt: string, params: any): Promise<string> {
    if (!this.client) throw new Error('Provider not initialized');
    
    const model = this.client.getGenerativeModel({ 
      model: params.model || 'gemini-pro'
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}