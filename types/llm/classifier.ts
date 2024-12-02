// /types/llm/classifier.ts
// Prompt Classification interfaces

import { Scope } from './scope';

export type PromptCategory = 
  | 'conversation'
  | 'code'
  | 'analysis'
  | 'creative'
  | 'translation'
  | 'technical'
  | 'academic'
  | 'custom';

export interface PromptAnalysis {
  primaryCategory: PromptCategory;
  secondaryCategories: PromptCategory[];
  confidence: number;
  suggestedLLMs: string[];
  requiresSpecialization: boolean;
  features: {
    complexity: number;
    creativity: number;
    technicalLevel: number;
    languageCount: number;
    expectedLength: number;
  };
  metadata: Record<string, any>;
}

export interface ClassificationRule {
  id: string;
  category: PromptCategory;
  patterns: string[];
  keywords: string[];
  weight: number;
  llmMapping: string[];
  minConfidence: number;
}

export interface PromptClassifierInterface {
  analyzePrompt(prompt: string, scope?: Scope): Promise<PromptAnalysis>;
  matchLLMs(analysis: PromptAnalysis): string[];
  addRule(rule: ClassificationRule): Promise<void>;
  removeRule(ruleId: string): Promise<void>;
  updateRule(ruleId: string, updates: Partial<ClassificationRule>): Promise<void>;
  getScoringMatrix(): Record<string, number>;
}