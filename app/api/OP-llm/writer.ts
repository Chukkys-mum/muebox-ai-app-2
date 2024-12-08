// File Path: app/api/llm/writer.ts

import { NextRequest, NextResponse } from 'next/server';
import llmConfig from '@/config/llm-config.json';
import { fetchWithTimeout } from '@/utils/fetch';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { prompt } = await request.json();

    // Validate the prompt
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Locate Writer configuration dynamically
    const writerConfig = llmConfig.models["Content Creation"].find(
      (model: any) => model.name === 'Writer'
    );

    if (!writerConfig) {
      return NextResponse.json(
        { error: 'Writer configuration not found' },
        { status: 404 }
      );
    }

    // Make the API call
    const response = await fetchWithTimeout(writerConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env[writerConfig.keyEnvVariable]}`,
      },
      body: JSON.stringify({
        input: prompt,
        max_tokens: 200, // Default value
        temperature: 0.7, // Default value
        top_p: 0.9, // Default value
        n: 1, // Default to 1 completion
      }),
      timeout: 5000, // Default timeout of 5 seconds
    });

    // Handle response errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Writer API error:', errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    // Return successful response
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Writer API call failed:', error.message || error);
    return NextResponse.json(
      { error: 'Writer API call failed' },
      { status: 500 }
    );
  }
}
