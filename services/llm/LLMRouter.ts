// /services/llm/LLMRouter.ts
// Router implementation

// NEW FILE: /services/llm/LLMRouter.ts

import {
    LLMRouterInterface,
    RoutingRequest,
    RoutingResponse,
    RouterError
  } from '@/types/llm/router';
  import { llmManager } from './LLMManager';
  import { promptClassifier } from './PromptClassifier';
  import { createClient } from '@/utils/supabase/server';
  
  export class LLMRouter implements LLMRouterInterface {
    private activeRequests: Map<string, RoutingRequest>;
    private supabase;
  
    constructor() {
      this.activeRequests = new Map();
      this.supabase = createClient();
    }
  
    public async route(request: RoutingRequest): Promise<RoutingResponse> {
      try {
        const startTime = new Date();
        this.activeRequests.set(request.id, request);
  
        // Determine LLM to use
        const llmId = await this.determineLLM(request);
        const llmConfig = llmManager.getLLMById(llmId);
  
        if (!llmConfig) {
          throw this.createError('LLM_NOT_FOUND', `LLM ${llmId} not found`, false);
        }
  
        // Get API key (prefer user's key if available)
        const apiKey = llmConfig.userAPIKey || llmConfig.platformAPIKey;
        if (!apiKey) {
          throw this.createError('NO_API_KEY', `No API key available for ${llmId}`, true);
        }
  
        // Make the API call
        const response = await fetch(llmConfig.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            prompt: request.prompt,
            ...llmConfig.defaultParams
          })
        });
  
        if (!response.ok) {
          const error = await response.json();
          throw this.createError('API_ERROR', error.message, true, error);
        }
  
        const result = await response.json();
        const completedAt = new Date();
  
        // Create response object
        const routingResponse: RoutingResponse = {
          requestId: request.id,
          result: result.choices[0].text,
          llmUsed: llmId,
          timing: {
            startedAt: startTime,
            completedAt,
            totalDuration: completedAt.getTime() - startTime.getTime()
          },
          tokenUsage: {
            prompt: result.usage.prompt_tokens,
            completion: result.usage.completion_tokens,
            total: result.usage.total_tokens
          },
          costs: this.calculateCosts(result.usage, llmConfig.cost),
          metadata: {
            model: result.model,
            originalResponse: result
          }
        };
  
        // Store response in database
        await this.logResponse(routingResponse);
  
        return routingResponse;
      } catch (error) {
        return await this.handleError(error as RouterError);
      } finally {
        this.activeRequests.delete(request.id);
      }
    }
  
    public async getRoutingHistory(filter?: Partial<RoutingRequest>): Promise<RoutingRequest[]> {
        try {
          let query = this.supabase
            .from('routing_history')
            .select('*')
            .order('created_at', { ascending: false });
      
          if (filter) {
            Object.entries(filter).forEach(([key, value]) => {
              if (value !== undefined) {
                query = query.eq(key, value);
              }
            });
          }
      
          const { data, error } = await query;
          if (error) throw error;
      
          // Transform the database records into RoutingRequest format
          return data.map(record => {
            const metadata = record.metadata as Record<string, any>;
            return {
              id: record.request_id,
              prompt: metadata?.prompt || '',
              forceLLM: record.llm_used,
              scope: metadata?.scope,
              maxRetries: metadata?.maxRetries || 0,
              timeout: metadata?.timeout || 30000,
              priority: metadata?.priority || 'normal'
            } as RoutingRequest;
          });
        } catch (error) {
          console.error('Failed to fetch routing history:', error);
          return [];
        }
      }
  
    public async cancelRequest(requestId: string): Promise<boolean> {
      const request = this.activeRequests.get(requestId);
      if (!request) return false;
  
      this.activeRequests.delete(requestId);
      
      // Log cancellation
      await this.supabase
        .from('routing_history')
        .update({ status: 'cancelled' })
        .eq('request_id', requestId);
  
      return true;
    }
  
    public getActiveRequests(): Promise<RoutingRequest[]> {
      return Promise.resolve(Array.from(this.activeRequests.values()));
    }
  
    public async handleError(error: RouterError): Promise<RoutingResponse> {  // Removed null
        console.error('Router error:', error);
      
        await this.supabase
          .from('routing_errors')
          .insert([{
            error_code: error.code,
            error_message: error.message,
            llm_id: error.llmId,
            context: error.context
          }]);
      
        // Instead of returning null, throw the error or return a fallback response
        throw error;  // Or return a fallback response
      }
  
    private async determineLLM(request: RoutingRequest): Promise<string> {
      if (request.forceLLM) {
        return request.forceLLM;
      }
  
      if (!request.analysis) {
        request.analysis = await promptClassifier.analyzePrompt(
          request.prompt, 
          request.scope
        );
      }
  
      const suggestedLLMs = request.analysis.suggestedLLMs;
      
      // Return first available LLM
      for (const llmId of suggestedLLMs) {
        const config = llmManager.getLLMById(llmId);
        if (config?.isEnabled) {
          return llmId;
        }
      }
  
      // Fallback to default
      return 'gpt-3.5-turbo';
    }
  
    private calculateCosts(usage: any, costConfig: any): {
        promptCost: number;
        completionCost: number;
        totalCost: number;
        currency: string;  // Added this
      } {
        return {
          promptCost: usage.prompt_tokens * costConfig.promptTokens,
          completionCost: usage.completion_tokens * costConfig.completionTokens,
          totalCost: (usage.prompt_tokens * costConfig.promptTokens) +
                    (usage.completion_tokens * costConfig.completionTokens),
          currency: costConfig.currency || 'USD'  // Added this
        };
      }
  
    private createError(
      code: string,
      message: string,
      retryable: boolean,
      context?: any
    ): RouterError {
      return { code, message, retryable, context };
    }
  
    private async logResponse(response: RoutingResponse): Promise<void> {
        try {
          // Convert Date objects to ISO strings for JSON compatibility
          const timingForDb = {
            startedAt: response.timing.startedAt.toISOString(),
            completedAt: response.timing.completedAt.toISOString(),
            totalDuration: response.timing.totalDuration
          };
      
          await this.supabase
            .from('routing_history')
            .insert([{
              request_id: response.requestId,
              llm_used: response.llmUsed,
              token_usage: response.tokenUsage,
              costs: response.costs,
              timing: timingForDb,  // Use the converted timing
              metadata: response.metadata
            }]);
        } catch (error) {
          console.error('Failed to log routing response:', error);
        }
      }
  } // Close LLMRouter class
  
  // Export singleton instance
  export const llmRouter = new LLMRouter();