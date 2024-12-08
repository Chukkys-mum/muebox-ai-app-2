// File Path: app/api/llm/azure-openai.ts

import { NextRequest, NextResponse } from 'next/server';
import type { LLMModel } from '@/types/llmConfig';
import llmConfig from '@/config/llm-config.json';
import { fetchWithTimeout } from '@/utils/fetch';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { prompt } = await request.json();

    // Validate the prompt
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required and must be a string' }, { status: 400 });
    }

    // Dynamically find the Azure OpenAI configuration
    const azureOpenAIConfig: LLMModel | undefined = llmConfig.models['Enterprise AI'].find(
      (model) => model.name === 'Azure OpenAI Service'
    );

    if (!azureOpenAIConfig) {
      console.error('Azure OpenAI configuration not found in llm-config.json');
      return NextResponse.json({ error: 'Azure OpenAI configuration not found' }, { status: 500 });
    }

    // Retrieve the API key
    const apiKey = process.env[azureOpenAIConfig.keyEnvVariable];
    if (!apiKey) {
      console.error('Azure OpenAI API key is missing from environment variables');
      return NextResponse.json({ error: 'API key is missing from environment variables' }, { status: 500 });
    }

    // Make the API request
    const response = await fetchWithTimeout(azureOpenAIConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey, // Ensure this is always a string
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 300, // Default or configurable value
        temperature: 0.7, // Default or configurable value
        top_p: 0.9, // Default or configurable value
        model: 'gpt-4', // Default or configurable model
      }),
      timeout: 5000, // Default timeout of 5 seconds
    });

    // Handle non-successful responses
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Azure OpenAI API error:', errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    // Parse and return the response data
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Azure OpenAI API call failed:', error.message || error);
    return NextResponse.json({ error: 'Azure OpenAI API call failed' }, { status: 500 });
  }
}
