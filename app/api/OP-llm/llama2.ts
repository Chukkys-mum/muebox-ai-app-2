// File Path: app/api/llm/llama2.ts

import { NextRequest, NextResponse } from 'next/server';
import { fetchWithTimeout } from '@/utils/fetch';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    // Validate the prompt
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required and must be a string' }, { status: 400 });
    }

    // Environment variables for LLaMA 2 API configuration
    const apiUrl = process.env.LLAMA2_API_URL;
    const apiKey = process.env.LLAMA2_API_KEY;

    // Ensure configuration is properly set
    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: 'LLaMA 2 API URL or API Key is not configured' },
        { status: 500 }
      );
    }

    // Default parameters for the API call
    const defaultConfig = {
      max_tokens: 300,
      temperature: 0.7,
      top_p: 0.9,
      timeout: 10000, // 10 seconds timeout
    };

    // Perform the API call
    const response = await fetchWithTimeout(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: defaultConfig.max_tokens,
        temperature: defaultConfig.temperature,
        top_p: defaultConfig.top_p,
      }),
      timeout: defaultConfig.timeout,
    });

    // Handle errors from the API response
    if (!response.ok) {
      const errorData = await response.json();
      console.error('LLaMA 2 API error:', errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    // Parse successful response
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('LLaMA 2 API call failed:', error.message || error);
    return NextResponse.json(
      { error: 'LLaMA 2 API call failed' },
      { status: 500 }
    );
  }
}
