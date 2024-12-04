// types/llm.ts

import { WithTimestamps, WithStatus } from './common';

// LLM Status type
export type LLMStatus = 'active' | 'deprecated' | 'testing';

// LLM Provider interface
export interface LLMProvider extends WithTimestamps {
  id: string;
  name: string;
  contact_info?: string;
  website?: string;
}

// LLM interface
export interface LLM extends WithTimestamps, WithStatus {
  id: string;
  name: string;
  theme?: string;
  description?: string;
  api_endpoint?: string;
  provider_id: string;
  status: LLMStatus;
}

// LLM Feature interface
export interface LLMFeature extends WithTimestamps {
  id: string;
  llm_id: string;
  feature: string;
  description?: string;
}

// LLM Usage Log interface
export interface LLMUsageLog extends WithTimestamps, WithStatus {
  id: string;
  llm_id: string;
  user_id: string;
  request_payload?: Record<string, any>;
  response_payload?: Record<string, any>;
}

// LLM Configuration interface
export interface LLMConfiguration {
  id: string;
  name: string;
  provider: string;
  api_endpoint: string;
  capabilities: string[];
  max_tokens: number;
  default_params: Record<string, any>;
  platform_api_key?: string;
  is_enabled: boolean;
  cost: {
    prompt_tokens: number;
    completion_tokens: number;
    currency: string;
  };
}

// LLM API Key interface
export interface LLMApiKey {
  id: string;
  llm_id: string;
  user_id: string;
  api_key: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// You can add more LLM-related types or interfaces here as needed

// For example, you might want to add types for LLM requests and responses:

export interface LLMRequest {
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
}

export interface LLMResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    text: string;
    index: number;
    logprobs: any;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Or types for LLM fine-tuning:

export interface LLMFineTuningJob {
  id: string;
  model: string;
  training_file: string;
  validation_file?: string;
  hyperparameters: Record<string, any>;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  created_at: string;
  updated_at: string;
}