// File Path: app/api/llm/gpt4.ts

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

    // Locate GPT-4 configuration dynamically
    const gpt4Config = llmConfig.models["General-Purpose"].find(
      (model: any) => model.name === 'GPT-4'
    );

    if (!gpt4Config) {
      return NextResponse.json(
        { error: 'GPT-4 configuration not found' },
        { status: 404 }
      );
    }

    // Make the API call
    const response = await fetchWithTimeout(gpt4Config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env[gpt4Config.keyEnvVariable]}`,
      },
      body: JSON.stringify({
        model: 'gpt-4', // Specify the model explicitly
        prompt,
        max_tokens: 1000, // Default to 1000 if not in config
        temperature: 0.7, // Default to 0.7
        top_p: 0.9, // Default to 0.9
        n: 1, // Default to 1 completion
      }),
      timeout: 15000, // Default timeout of 15 seconds
    });

    // Handle response errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error('GPT-4 API error:', errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    // Return successful response
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('GPT-4 API call failed:', error.message || error);
    return NextResponse.json(
      { error: 'GPT-4 API call failed' },
      { status: 500 }
    );
  }
}
