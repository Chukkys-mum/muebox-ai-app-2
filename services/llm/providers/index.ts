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
