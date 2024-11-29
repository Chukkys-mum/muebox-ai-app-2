// /services/llm/PromptClassifier.ts
// Prompt Classification implementation

// NEW FILE: /services/llm/PromptClassifier.ts

import { 
    PromptClassifierInterface, 
    PromptAnalysis, 
    ClassificationRule,
    PromptCategory 
  } from '@/types/llm/classifier';
  import { Scope } from '@/types/llm/scope';
  import { createClient } from '@/utils/supabase/server';
  
  export class PromptClassifier implements PromptClassifierInterface {
    private rules: Map<string, ClassificationRule>;
    private supabase;
    private scoringMatrix: Record<string, number>;
  
    constructor() {
      this.rules = new Map();
      this.supabase = createClient();
      this.scoringMatrix = {};
      this.initialize();
    }
  
    private async initialize() {
      try {
        const { data: rules, error } = await this.supabase
          .from('classification_rules')
          .select('*');
  
        if (error) throw error;
  
        rules?.forEach(rule => {
          this.rules.set(rule.id, rule);
        });
  
        await this.updateScoringMatrix();
      } catch (error) {
        console.error('Failed to initialize classification rules:', error);
      }
    }
  
    private async updateScoringMatrix() {
      this.scoringMatrix = {};
      this.rules.forEach(rule => {
        rule.llmMapping.forEach(llmId => {
          if (!this.scoringMatrix[llmId]) {
            this.scoringMatrix[llmId] = 0;
          }
          this.scoringMatrix[llmId] += rule.weight;
        });
      });
    }
  
    public async analyzePrompt(prompt: string, scope?: Scope): Promise<PromptAnalysis> {
      let scores: Map<PromptCategory, number> = new Map();
      let llmScores: Map<string, number> = new Map();
  
      // Analyze with each rule
      this.rules.forEach(rule => {
        let score = 0;
  
        // Check patterns
        rule.patterns.forEach(pattern => {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(prompt)) {
            score += rule.weight;
          }
        });
  
        // Check keywords
        rule.keywords.forEach(keyword => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'i');
          if (regex.test(prompt)) {
            score += rule.weight * 0.5;
          }
        });
  
        // Update category scores
        if (score > 0) {
          scores.set(rule.category, (scores.get(rule.category) || 0) + score);
          rule.llmMapping.forEach(llmId => {
            llmScores.set(llmId, (llmScores.get(llmId) || 0) + score);
          });
        }
      });
  
      // Calculate primary and secondary categories
      const sortedCategories = Array.from(scores.entries())
        .sort((a, b) => b[1] - a[1]);
  
      const primaryCategory = sortedCategories[0]?.[0] || 'conversation';
      const secondaryCategories = sortedCategories
        .slice(1, 4)
        .map(([category]) => category);
  
      // Calculate confidence
      const totalScore = Array.from(scores.values())
        .reduce((sum, score) => sum + score, 0);
      const primaryScore = scores.get(primaryCategory) || 0;
      const confidence = totalScore > 0 ? primaryScore / totalScore : 0.5;
  
      // Get suggested LLMs
      const suggestedLLMs = Array.from(llmScores.entries())
        .sort((a, b) => b[1] - a[1])
        .filter(([_, score]) => score >= (rule => rule.minConfidence))
        .map(([llmId]) => llmId);
  
      // Analyze features
      const features = {
        complexity: this.analyzeComplexity(prompt),
        creativity: this.analyzeCreativity(prompt),
        technicalLevel: this.analyzeTechnicalLevel(prompt),
        languageCount: this.detectLanguages(prompt),
        expectedLength: this.estimateResponseLength(prompt)
      };
  
      // Consider scope if provided
      if (scope) {
        this.applyScopeModifiers(suggestedLLMs, scope);
      }
  
      return {
        primaryCategory,
        secondaryCategories,
        confidence,
        suggestedLLMs,
        requiresSpecialization: confidence > 0.8,
        features,
        metadata: {
          rawScores: Object.fromEntries(scores),
          llmScores: Object.fromEntries(llmScores),
          analysisVersion: '1.0'
        }
      };
    }
  
    public matchLLMs(analysis: PromptAnalysis): string[] {
      return analysis.suggestedLLMs;
    }
  
    public async addRule(rule: ClassificationRule): Promise<void> {
      try {
        const { error } = await this.supabase
          .from('classification_rules')
          .insert([rule]);
  
        if (error) throw error;
  
        this.rules.set(rule.id, rule);
        await this.updateScoringMatrix();
      } catch (error) {
        console.error('Failed to add classification rule:', error);
        throw error;
      }
    }
  
    public async removeRule(ruleId: string): Promise<void> {
      try {
        const { error } = await this.supabase
          .from('classification_rules')
          .delete()
          .eq('id', ruleId);
  
        if (error) throw error;
  
        this.rules.delete(ruleId);
        await this.updateScoringMatrix();
      } catch (error) {
        console.error('Failed to remove classification rule:', error);
        throw error;
      }
    }
  
    public async updateRule(ruleId: string, updates: Partial<ClassificationRule>): Promise<void> {
      try {
        const { error } = await this.supabase
          .from('classification_rules')
          .update(updates)
          .eq('id', ruleId);
  
        if (error) throw error;
  
        const existingRule = this.rules.get(ruleId);
        if (existingRule) {
          this.rules.set(ruleId, { ...existingRule, ...updates });
        }
        await this.updateScoringMatrix();
      } catch (error) {
        console.error('Failed to update classification rule:', error);
        throw error;
      }
    }
  
    public getScoringMatrix(): Record<string, number> {
      return { ...this.scoringMatrix };
    }
  
    // Helper methods for feature analysis
    private analyzeComplexity(prompt: string): number {
      // Implement complexity analysis logic
      return 0.5; // Placeholder
    }
  
    private analyzeCreativity(prompt: string): number {
      // Implement creativity analysis logic
      return 0.5; // Placeholder
    }
  
    private analyzeTechnicalLevel(prompt: string): number {
      // Implement technical level analysis logic
      return 0.5; // Placeholder
    }
  
    private detectLanguages(prompt: string): number {
      // Implement language detection logic
      return 1; // Placeholder
    }
  
    private estimateResponseLength(prompt: string): number {
      // Implement length estimation logic
      return 100; // Placeholder
    }
  
    private applyScopeModifiers(suggestedLLMs: string[], scope: Scope): void {
      if (scope.llmPreferences) {
        const { preferred, excluded } = scope.llmPreferences;
        // Prioritize preferred LLMs
        preferred.forEach(llmId => {
          if (!suggestedLLMs.includes(llmId)) {
            suggestedLLMs.unshift(llmId);
          }
        });
        // Remove excluded LLMs
        excluded.forEach(llmId => {
          const index = suggestedLLMs.indexOf(llmId);
          if (index > -1) {
            suggestedLLMs.splice(index, 1);
          }
        });
      }
    }
  }
  
  // Export singleton instance
  export const promptClassifier = new PromptClassifier();