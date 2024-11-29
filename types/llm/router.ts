// /types/llm/router.ts
// Router interfaces

export interface RoutingRequest {
    id: string;
    prompt: string;
    scope?: Scope;
    analysis?: PromptAnalysis;
    forceLLM?: string;
    maxRetries?: number;
    timeout?: number;
    priority?: 'high' | 'normal' | 'low';
  }
  
  export interface RoutingResponse {
    requestId: string;
    result: string;
    llmUsed: string;
    fallbacksUsed?: string[];
    timing: {
      startedAt: Date;
      completedAt: Date;
      totalDuration: number;
    };
    tokenUsage: {
      prompt: number;
      completion: number;
      total: number;
    };
    costs: {
      promptCost: number;
      completionCost: number;
      totalCost: number;
      currency: string;
    };
    metadata: Record<string, any>;
  }
  
  export interface RouterError {
    code: string;
    message: string;
    llmId?: string;
    retryable: boolean;
    context?: Record<string, any>;
  }
  
  export interface LLMRouterInterface {
    route(request: RoutingRequest): Promise<RoutingResponse>;
    getRoutingHistory(filter?: Partial<RoutingRequest>): Promise<RoutingRequest[]>;
    cancelRequest(requestId: string): Promise<boolean>;
    getActiveRequests(): Promise<RoutingRequest[]>;
    handleError(error: RouterError): Promise<RoutingResponse | null>;
  }