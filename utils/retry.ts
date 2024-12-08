// /utils/retry.ts
interface RetryOptions {
    retries: number;
    backoff?: boolean;
    onRetry?: (error: Error, attempt: number) => void;
  }
  
  export async function retry<T>(
    operation: () => Promise<T>,
    options: RetryOptions
  ): Promise<T> {
    const { retries, backoff = true, onRetry } = options;
  
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (err) {
        if (attempt === retries) throw err;
        
        const error = err as Error;
        onRetry?.(error, attempt);
  
        if (backoff) {
          // Exponential backoff with jitter
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          const jitter = Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay + jitter));
        }
      }
    }
  
    throw new Error('Retry operation failed');
  }