// File Path: app/api/llm/dalle.ts

import { NextRequest, NextResponse } from 'next/server';
import llmConfig from '@/config/llm-config.json';
import { fetchWithTimeout } from '@/utils/fetch';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required and must be a string' }, { status: 400 });
    }

    // Locate the DALL-E configuration dynamically
    const dalleConfig = llmConfig.models['Image-Related'].find(
      (model) => model.name === 'DALL-E'
    );

    if (!dalleConfig) {
      console.error('DALL-E configuration not found in llm-config.json');
      return NextResponse.json({ error: 'DALL-E configuration not found' }, { status: 500 });
    }

    // Retrieve the API key
    const apiKey = process.env[dalleConfig.keyEnvVariable];
    if (!apiKey) {
      console.error('DALL-E API key is missing from environment variables');
      return NextResponse.json({ error: 'API key is missing from environment variables' }, { status: 500 });
    }

    // Define DALL-E specific parameters
    const size = '1024x1024'; // Default image size
    const timeout = 5000; // Default timeout (5 seconds)

    const response = await fetchWithTimeout(dalleConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        n: 1, // Number of images to generate
        size: size, // Image dimensions
        response_format: 'url', // Retrieve image URLs
      }),
      timeout: timeout,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DALL-E API error:', errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('DALL-E API call failed:', error.message || error);
    return NextResponse.json({ error: 'DALL-E API call failed' }, { status: 500 });
  }
}
