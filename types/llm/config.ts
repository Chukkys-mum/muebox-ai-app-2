// /types/llm/config.ts
// LLM Configuration interfaces

export interface LLMModelParams {
    temperature: number;
    topP: number;
    maxTokens: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stop?: string[];
  }
  
  export interface LLMConfig {
    id: string;
    name: string;
    provider: string;
    apiEndpoint: string;
    capabilities: string[];
    maxTokens: number;
    defaultParams: LLMModelParams;
    platformAPIKey?: string;
    userAPIKey?: string;
    isEnabled: boolean;
    cost: {
      promptTokens: number;
      completionTokens: number;
      currency: string;
    };
  }
  
  export interface LLMConfigManager {
    getAvailableLLMs(): LLMConfig[];
    getLLMById(id: string): LLMConfig | null;
    setUserAPIKey(llmId: string, apiKey: string): void;
    validateAPIKey(llmId: string, apiKey: string): Promise<boolean>;
    updateLLMConfig(llmId: string, config: Partial<LLMConfig>): void;
  }