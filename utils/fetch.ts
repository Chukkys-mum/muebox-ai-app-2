// /utils/fetch.ts

export async function fetchWithTimeout(
    resource: RequestInfo,
    options: RequestInit & { timeout?: number } = {}
  ): Promise<Response> {
    const { timeout = 8000, ...fetchOptions } = options;
  
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
  
    try {
      const response = await fetch(resource, {
        ...fetchOptions,
        signal: controller.signal,
      });
      return response;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    } finally {
      clearTimeout(id);
    }
  }
  