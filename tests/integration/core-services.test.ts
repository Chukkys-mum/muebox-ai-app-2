// NEW FILE: /tests/integration/core-services.test.ts
// This is a new test file for validating the integration between core LLM services

import { describe, it, expect, beforeEach, jest } from '@testing-library/jest-dom';
import { LLMManager } from '@/services/llm/LLMManager';
import { LLMRouter } from '@/services/llm/LLMRouter';
import { PromptClassifier } from '@/services/llm/PromptClassifier';
import { ScopeManager } from '@/services/llm/ScopeManager';
import { SpeechManager } from '@/services/llm/SpeechManager';

describe('Core Services Integration', () => {
  let llmManager: LLMManager;
  let llmRouter: LLMRouter;
  let promptClassifier: PromptClassifier;
  let scopeManager: ScopeManager;
  let speechManager: SpeechManager;

  beforeEach(() => {
    llmManager = new LLMManager();
    llmRouter = new LLMRouter();
    promptClassifier = new PromptClassifier();
    scopeManager = new ScopeManager();
    speechManager = new SpeechManager();
  });

  describe('End-to-End Request Flow', () => {
    it('should process a complete request through all services', async () => {
      // Create a test scope
      const scope = await scopeManager.createScope({
        type: 'chat',
        name: 'Test Chat',
        context: {
          goals: ['test conversation'],
          constraints: []
        }
      });

      // Test prompt
      const prompt = "Write a simple Python function to calculate factorial";

      // Classify the prompt
      const classification = await promptClassifier.analyzePrompt(prompt, scope);
      expect(classification.primaryCategory).toBe('code');
      
      // Get available LLMs
      const availableLLMs = llmManager.getAvailableLLMs();
      expect(availableLLMs.length).toBeGreaterThan(0);

      // Route the request
      const response = await llmRouter.route({
        id: 'test-1',
        prompt,
        scope: await scope, // Wait for scope promise to resolve
        analysis: classification
      });

      expect(response.success).toBe(true);
      expect(response.result).toBeDefined();
    });

    it('should maintain context across multiple interactions', async () => {
      const scope = await scopeManager.createScope({
        type: 'chat',
        name: 'Contextual Chat',
        context: {
          goals: ['maintain context'],
          constraints: []
        }
      });

      // First interaction
      const response1 = await llmRouter.route({
        id: 'test-4-1',
        prompt: 'What is the capital of France?',
        scope: await scope // Wait for scope promise to resolve
      });

      // Second interaction should maintain context
      const response2 = await llmRouter.route({
        id: 'test-4-2',
        prompt: 'What is its population?',
        scope: await scope // Wait for scope promise to resolve
      });

      expect(response2.result).toContain('Paris');
    });
});

  describe('Error Handling and Fallbacks', () => {
    it('should handle service failures gracefully', async () => {
      // Simulate primary LLM failure
      jest.spyOn(llmManager, 'getLLMById').mockImplementationOnce(() => null);

      const response = await llmRouter.route({
        id: 'test-2',
        prompt: 'Test prompt',
        maxRetries: 1
      });

      expect(response.fallbacksUsed).toBeDefined();
      expect(response.success).toBe(true);
    });
  });

  describe('Speech Integration', () => {
    it('should convert speech to text and process through LLM pipeline', async () => {
      const audioBlob = new Blob([]); // Mock audio data
      
      // Convert speech to text
      const text = await speechManager.convertToText(audioBlob);
      expect(text).toBeDefined();

      // Process through normal pipeline
      const classification = await promptClassifier.analyzePrompt(text);
      const response = await llmRouter.route({
        id: 'test-3',
        prompt: text,
        analysis: classification
      });

      expect(response.success).toBe(true);
    });
  });

  describe('Scope Management', () => {
    it('should maintain context across multiple interactions', async () => {
      const scope = scopeManager.createScope({
        type: 'chat',
        name: 'Contextual Chat',
        context: {
          goals: ['maintain context'],
          constraints: []
        }
      });

      // First interaction
      const response1 = await llmRouter.route({
        id: 'test-4-1',
        prompt: 'What is the capital of France?',
        scope
      });

      // Second interaction should maintain context
      const response2 = await llmRouter.route({
        id: 'test-4-2',
        prompt: 'What is its population?',
        scope
      });

      expect(response2.result).toContain('Paris');
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests efficiently', async () => {
      const prompts = [
        'Write a Python function',
        'Translate to Spanish',
        'Explain quantum physics',
        'Write a poem'
      ];

      const startTime = Date.now();
      
      const responses = await Promise.all(
        prompts.map((prompt, index) => 
          llmRouter.route({
            id: `perf-test-${index}`,
            prompt
          })
        )
      );

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(responses).toHaveLength(prompts.length);
      expect(totalTime).toBeLessThan(5000); // Should complete in under 5 seconds
      responses.forEach(response => {
        expect(response.success).toBe(true);
      });
    });
  });

  describe('Template Integration', () => {
    it('should apply template configurations correctly', async () => {
      const template = {
        id: 'code-review',
        name: 'Code Review',
        context: {
          goals: ['review code quality'],
          constraints: [], // Added required constraints
          format: 'markdown'
        }
      };

      const scope = await scopeManager.createScope({
        type: 'template',
        templateId: template.id,
        ...template
      });

      const response = await llmRouter.route({
        id: 'test-5',
        prompt: 'Review this code: function add(a,b) { return a+b; }',
        scope
      });

      expect(response.success).toBe(true);
      expect(response.result).toContain('```');  // Should contain markdown formatting
    });
  });
});