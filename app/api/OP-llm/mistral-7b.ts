// File Path: app/api/llm/mistral-7b.ts

import { NextRequest, NextResponse } from 'next/server';
import { fetchWithTimeout } from '@/utils/fetch';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required and must be a string' }, { status: 400 });
    }

    // Extract environment variables
    const apiUrl = process.env.MISTRAL_7B_API_URL;
    const apiKey = process.env.MISTRAL_7B_API_KEY;

    // Validate API configuration
    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: 'Mistral 7B API URL or API Key is not configured' },
        { status: 500 }
      );
    }

    // Default API call parameters for Mistral 7B
    const defaultConfig = {
      max_tokens: 300,
      temperature: 0.7,
      top_p: 0.9,
      model: 'open-mistral-7b',
      timeout: 10000, // 10 seconds timeout
    };

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
        model: defaultConfig.model,
      }),
      timeout: defaultConfig.timeout,
    });

    // Handle non-200 responses
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Mistral 7B API error:', errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    // Parse successful response
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Mistral 7B API call failed:', error.message || error);
    return NextResponse.json(
      { error: 'Mistral 7B API call failed' },
      { status: 500 }
    );
  }
}
