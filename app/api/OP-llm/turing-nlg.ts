// File Path: app/api/llm/turing-nlg.ts

import { NextRequest, NextResponse } from 'next/server';
import type { LLMModel } from '@/types/llmConfig';
import llmConfig from '@/config/llm-config.json';
import { fetchWithTimeout } from '@/utils/fetch';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    // Validate the prompt
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required and must be a string' }, { status: 400 });
    }

    // Find the Turing-NLG configuration dynamically
    const turingNLGConfig: LLMModel | undefined = llmConfig.models['Enterprise AI'].find(
      (model) => model.name === 'Turing-NLG'
    );

    if (!turingNLGConfig) {
      console.error('Turing-NLG configuration not found in llm-config.json');
      return NextResponse.json({ error: 'Turing-NLG configuration not found' }, { status: 500 });
    }

    // Retrieve the API key
    const apiKey = process.env[turingNLGConfig.keyEnvVariable];
    if (!apiKey) {
      console.error('Turing-NLG API key is missing from environment variables');
      return NextResponse.json({ error: 'API key is missing from environment variables' }, { status: 500 });
    }

    // Make the API request
    const response = await fetchWithTimeout(turingNLGConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`, // Ensure this is always a string
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 300, // Default or configurable value
        temperature: 0.7, // Default or configurable value
        top_p: 0.9, // Default or configurable value
        model: 'default-turing-nlg', // Default or configurable model
      }),
      timeout: 5000, // Default timeout of 5 seconds
    });

    // Handle non-successful responses
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Turing-NLG API error:', errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    // Parse and return the response data
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Turing-NLG API call failed:', error.message || error);
    return NextResponse.json({ error: 'Turing-NLG API call failed' }, { status: 500 });
  }
}
