// components/chatwidget/api/openai.ts
import endent from 'endent';

// Configuration
const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// API Error Handling
class ApiError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleApiError = async (response: Response, operation: string) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`OpenAI ${operation} failed:`, {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
    });

    throw new ApiError(
      errorData.error?.message || `${operation} failed: ${response.statusText}`,
      response.status,
      errorData.error?.code
    );
  }
  return response.json();
};

// Unified Request Method
const makeRequest = async (
  url: string,
  options: RequestInit,
  operation: string
) => {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new ApiError('OpenAI API key is not configured');
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v1',
    ...options.headers,
  };

  return fetch(url, { ...options, headers })
    .then((response) => handleApiError(response, operation))
    .catch((error) => {
      console.error(`${operation} error:`, error);
      throw error;
    });
};

export const openAIApi = {
  getAssistant: async () => {
    const assistantId = process.env.NEXT_PUBLIC_OPENAI_ASSISTANT_KEY;
    if (!assistantId) {
      throw new ApiError('Assistant ID is not configured');
    }

    console.log('Fetching assistant:', assistantId);
    return makeRequest(
      `https://api.openai.com/v1/assistants/${assistantId}`,
      { method: 'GET' },
      'Get Assistant'
    );
  },

  createThread: async () => {
    console.log('Creating a new thread');
    return makeRequest(
      'https://api.openai.com/v1/threads',
      { method: 'POST' },
      'Create Thread'
    );
  },

  createMessage: async (threadId: string, content: string) => {
    if (!threadId) {
      throw new ApiError('Thread ID is required');
    }

    const prompt = endent`do me this: ${content}`;
    console.log('Creating message for thread:', threadId);
    return makeRequest(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ role: 'user', content: prompt }),
      },
      'Create Message'
    );
  },

  getMessage: async (threadId: string) => {
    if (!threadId) {
      throw new ApiError('Thread ID is required');
    }

    console.log('Fetching messages from thread:', threadId);
    return makeRequest(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      { method: 'GET' },
      'Get Messages'
    );
  },

  runAssistant: async (threadId: string, assistantId: string) => {
    if (!threadId || !assistantId) {
      throw new ApiError('Thread ID and Assistant ID are required');
    }

    console.log('Running assistant:', assistantId, 'on thread:', threadId);
    return makeRequest(
      `https://api.openai.com/v1/threads/${threadId}/runs`,
      {
        method: 'POST',
        body: JSON.stringify({ assistant_id: assistantId }),
      },
      'Run Assistant'
    );
  },

  deleteThread: async (threadId: string) => {
    if (!threadId) {
      throw new ApiError('Thread ID is required');
    }

    console.log('Deleting thread:', threadId);
    return makeRequest(
      `https://api.openai.com/v1/threads/${threadId}`,
      { method: 'DELETE' },
      'Delete Thread'
    );
  },
};
