// /utils/type-converters.ts

import { Json } from '@/types/types_db';
import { ScopeContext, LLMPreferences } from '@/types/llm/scope';

export function convertToJson<T>(data: T): Json {
  return data as unknown as Json;
}

export function convertFromJson<T>(json: Json): T {
  return json as unknown as T;
}

export function validateScopeContext(json: Json): ScopeContext {
  const context = json as unknown as ScopeContext;
  if (!Array.isArray(context.goals) || !Array.isArray(context.constraints)) {
    throw new Error('Invalid ScopeContext structure');
  }
  return context;
}

export function validateLLMPreferences(json: Json | null): LLMPreferences | undefined {
  if (!json) return undefined;
  
  const prefs = json as unknown as LLMPreferences;
  if (!Array.isArray(prefs.preferred) || !Array.isArray(prefs.excluded)) {
    throw new Error('Invalid LLMPreferences structure');
  }
  return prefs;
}