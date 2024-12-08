// File Path: app/api/llm/nemo.ts

import { NextRequest, NextResponse } from 'next/server';
import llmConfig from '@/config/llm-config.json';
import { fetchWithTimeout } from '@/utils/fetch';

export async function POST(request: NextRequest) {
  try {
    // Parse request JSON body
    const { prompt } = await request.json();

    // Validate the prompt
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Retrieve NeMo configuration
    const nemoConfig = llmConfig.models["General-Purpose"].find(
      (model: any) => model.name === 'NeMo'
    );

    if (!nemoConfig) {
      return NextResponse.json(
        { error: 'NeMo configuration not found' },
        { status: 404 }
      );
    }

    // Make the API call using fetchWithTimeout
    const response = await fetchWithTimeout(nemoConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env[nemoConfig.keyEnvVariable]}`,
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 300, // Default value
        temperature: 0.7, // Default value
        top_p: 0.9, // Default value
      }),
      timeout: 15000, // Default timeout
    });

    // Handle response errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error('NeMo API error:', errorData);
      return NextResponse.json(
        { error: errorData },
        { status: response.status }
      );
    }

    // Parse and return successful response
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('NeMo API call failed:', error.message || error);
    return NextResponse.json(
      { error: 'NeMo API call failed' },
      { status: 500 }
    );
  }
}
