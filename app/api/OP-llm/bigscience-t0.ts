// File Path: app/api/llm/bigscience-t0.ts

import { NextRequest, NextResponse } from 'next/server';
import { fetchWithTimeout } from '@/utils/fetch';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    // Validate the prompt
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required and must be a string' }, { status: 400 });
    }

    // Environment variables for BigScience T0 API configuration
    const apiUrl = process.env.BIGSCIENCE_T0_API_URL;
    const apiKey = process.env.BIGSCIENCE_T0_API_KEY;

    // Ensure configuration is properly set
    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: 'BigScience T0 API URL or API Key is not configured' },
        { status: 500 }
      );
    }

    // Default parameters for the API call
    const defaultConfig = {
      max_tokens: 300,
      temperature: 0.7,
      top_p: 0.9,
      repetition_penalty: 1.0,
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
        inputs: prompt,
        parameters: {
          max_length: defaultConfig.max_tokens,
          temperature: defaultConfig.temperature,
          top_p: defaultConfig.top_p,
          repetition_penalty: defaultConfig.repetition_penalty,
        },
      }),
      timeout: defaultConfig.timeout,
    });

    // Handle errors from the API response
    if (!response.ok) {
      const errorData = await response.json();
      console.error('BigScience T0 API error:', errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    // Parse successful response
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('BigScience T0 API call failed:', error.message || error);
    return NextResponse.json(
      { error: 'BigScience T0 API call failed' },
      { status: 500 }
    );
  }
}
