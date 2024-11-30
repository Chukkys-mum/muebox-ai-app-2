// /types/llm/provider.ts

export interface ProviderConfig {
    apiKey: string;
    apiEndpoint?: string;
    organizationId?: string;
    options?: Record<string, any>;
  }
  
  export interface ModelParameters {
    model: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stop?: string[];
    [key: string]: any;
  }
  
  export interface CompletionResult {
    text: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    metadata?: Record<string, any>;
  }
  
  export interface ProviderCapability {
    type: 'text' | 'code' | 'chat' | 'analysis' | 'embeddings' | 'vision' | 'audio' | 'functions';
    models: string[];
    maxTokens?: number;
    features?: string[];
  }
  
  export interface LLMProvider {
    id: string;
    name: string;
    description: string;
    capabilities: string[];
    
    // Core methods
    initialize(config: ProviderConfig): Promise<void>;
    validate(apiKey: string): Promise<boolean>;
    complete(prompt: string, params: ModelParameters): Promise<string>;
    
    // Optional capabilities
    stream?(prompt: string, params: ModelParameters): AsyncGenerator<string>;
    embed?(text: string): Promise<number[]>;
    tokenize?(text: string): Promise<string[]>;
    
    // Optional features
    getModelList?(): Promise<string[]>;
    estimateTokens?(text: string): number;
    calculateCost?(usage: { promptTokens: number; completionTokens: number }): number;
  }
  
  export interface ProviderError extends Error {
    code: string;
    isRetryable: boolean;
    raw?: any;
  }
  
  // Provider settings types
  export interface ProviderSettings {
    id: string;
    isEnabled: boolean;
    defaultModel: string;
    apiEndpoint?: string;
    contextWindow?: number;
    rateLimit?: {
      requestsPerMinute: number;
      tokensPerMinute: number;
    };
    costSettings?: {
      promptTokenRate: number;
      completionTokenRate: number;
      currency: string;
    };
    metadata?: Record<string, any>;
  }
  
  // Provider usage statistics
  export interface ProviderUsageStats {
    providerId: string;
    userId: string;
    timestamp: Date;
    tokensUsed: number;
    cost: number;
    requestCount: number;
    errorCount: number;
    averageLatency: number;
    models: Record<string, {
      requests: number;
      tokens: number;
      cost: number;
    }>;
  }