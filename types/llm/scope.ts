// /types/llm/scope.ts
// Scope Management interfaces

// NEW FILE: /types/llm/scope.ts

export type ScopeType = 'chat' | 'template' | 'essay' | 'custom';

export interface ScopeContext {
  goals: string[];
  constraints: string[];
  sources?: string[];
  format?: string;
  customInstructions?: string;
  tone?: string;
  language?: string;
}

export interface LLMPreferences {
  preferred: string[];
  excluded: string[];
  fallback?: string[];
}

export interface Scope {
  id: string;
  type: ScopeType;
  name: string;
  description?: string;
  context: ScopeContext;
  llmPreferences?: LLMPreferences;
  templateId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScopeManagerInterface {
  createScope(config: Partial<Scope>): Scope;
  updateScope(id: string, updates: Partial<Scope>): Scope;
  getScope(id: string): Scope | null;
  deleteScope(id: string): boolean;
  validateScope(scope: Scope): boolean;
  listScopes(filter?: Partial<Scope>): Scope[];
}