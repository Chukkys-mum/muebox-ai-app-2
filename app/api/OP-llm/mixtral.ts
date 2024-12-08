// File Path: app/api/llm/mixtral.ts

import { NextRequest, NextResponse } from 'next/server';
import { fetchWithTimeout } from '@/utils/fetch';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required and must be a string' }, { status: 400 });
    }

    const apiUrl = process.env.MIXTRAL_API_URL;
    const apiKey = process.env.MIXTRAL_API_KEY;

    if (!apiUrl || !apiKey) {
      return NextResponse.json({ error: 'Mixtral API URL or API Key is not configured' }, { status: 500 });
    }

    const response = await fetchWithTimeout(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
        model: 'open-mixtral-8x7b'
      }),
      timeout: 10000 // 10 seconds timeout
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Mixtral API error:', errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Mixtral API call failed:', error.message || error);
    return NextResponse.json({ error: 'Mixtral API call failed' }, { status: 500 });
  }
}
