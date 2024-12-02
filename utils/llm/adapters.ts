// /utils/llm/adapters.ts
import { LLMConfig, LLMModelParams } from '@/types/llm/config';
import { ClassificationRule, PromptCategory } from '@/types/llm/classifier';
import { Database, Json } from '@/types/types_db';

type DBLLMConfig = Database['public']['Tables']['llm_configurations']['Row'];
type DBClassificationRule = Database['public']['Tables']['classification_rules']['Row'];

export function adaptLLMConfig(dbConfig: DBLLMConfig): LLMConfig {
  // Add type assertion or validation for defaultParams
  const defaultParams = dbConfig.default_params as unknown as LLMModelParams;
  
  return {
    id: dbConfig.id,
    name: dbConfig.name,
    provider: dbConfig.provider,
    apiEndpoint: dbConfig.api_endpoint,
    capabilities: dbConfig.capabilities,
    maxTokens: dbConfig.max_tokens,
    defaultParams,  // Use the validated params
    platformAPIKey: dbConfig.platform_api_key,
    isEnabled: dbConfig.is_enabled,
    cost: {
      promptTokens: dbConfig.cost.prompt_tokens,
      completionTokens: dbConfig.cost.completion_tokens,
      currency: dbConfig.cost.currency
    }
  };
}

export function adaptLLMConfigForDB(config: Partial<LLMConfig>): Partial<DBLLMConfig> {
  return {
    name: config.name,
    provider: config.provider,
    api_endpoint: config.apiEndpoint,
    capabilities: config.capabilities,
    max_tokens: config.maxTokens,
    default_params: config.defaultParams as unknown as Json,  // Cast to Json type
    platform_api_key: config.platformAPIKey,
    is_enabled: config.isEnabled,
    cost: config.cost ? {
      prompt_tokens: config.cost.promptTokens,
      completion_tokens: config.cost.completionTokens,
      currency: config.cost.currency
    } : undefined
  };
}

export function adaptClassificationRule(dbRule: DBClassificationRule): ClassificationRule {
  return {
    id: dbRule.id,
    category: dbRule.category as PromptCategory,
    patterns: dbRule.patterns,
    keywords: dbRule.keywords,
    weight: dbRule.weight,
    llmMapping: dbRule.llm_mapping,
    minConfidence: dbRule.min_confidence
  };
}

export function adaptClassificationRuleForDB(rule: ClassificationRule): Partial<DBClassificationRule> {
  return {
    category: rule.category,
    patterns: rule.patterns,
    keywords: rule.keywords,
    weight: rule.weight,
    llm_mapping: rule.llmMapping,
    min_confidence: rule.minConfidence
  };
}