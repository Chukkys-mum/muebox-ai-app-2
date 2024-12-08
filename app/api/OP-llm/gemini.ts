// File Path: app/api/llm/gemini.ts

import { NextRequest, NextResponse } from 'next/server';
import llmConfig from '@/config/llm-config.json';
import { fetchWithTimeout } from '@/utils/fetch';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required and must be a string' }, { status: 400 });
    }

    // Locate the Gemini configuration dynamically
    const geminiConfig = llmConfig.models['Image-Related'].find(
      (model) => model.name === 'Gemini'
    );

    if (!geminiConfig) {
      console.error('Gemini configuration not found in llm-config.json');
      return NextResponse.json({ error: 'Gemini configuration not found' }, { status: 500 });
    }

    // Retrieve the API key
    const apiKey = process.env[geminiConfig.keyEnvVariable];
    if (!apiKey) {
      console.error('Gemini API key is missing from environment variables');
      return NextResponse.json({ error: 'API key is missing from environment variables' }, { status: 500 });
    }

    const response = await fetchWithTimeout(geminiConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 300, // Default to 300 tokens
        temperature: 0.7, // Default temperature
        top_p: 0.9, // Default top-p value
      }),
      timeout: 5000, // Default timeout of 5 seconds
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Gemini API call failed:', error.message || error);
    return NextResponse.json({ error: 'Gemini API call failed' }, { status: 500 });
  }
}
