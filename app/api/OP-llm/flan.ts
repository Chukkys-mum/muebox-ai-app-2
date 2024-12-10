// File Path: app/api/llm/flan.ts

import { NextRequest, NextResponse } from 'next/server';
import llmConfig from '@/config/llm-config.json';
import { fetchWithTimeout } from '@/utils/fetch';

export async function POST(request: NextRequest) {
  try {
    // Parse the request JSON
    const { prompt } = await request.json();

    // Validate the prompt
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Locate Flan configuration dynamically
    const flanConfig = llmConfig.models["Specialized Tasks"].find(
      (model: any) => model.name === 'Flan'
    );

    if (!flanConfig) {
      return NextResponse.json(
        { error: 'Flan configuration not found' },
        { status: 404 }
      );
    }

    // Make the API call
    const response = await fetchWithTimeout(flanConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env[flanConfig.keyEnvVariable]}`,
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 200, // Default value
        temperature: 0.5, // Default value
        top_p: 0.8, // Default value
        model: 'flan-ul2', // Default model
      }),
      timeout: 15000, // Default timeout
    });

    // Handle response errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Flan API error:', errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    // Return successful response
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Flan API call failed:', error.message || error);
    return NextResponse.json(
      { error: 'Flan API call failed' },
      { status: 500 }
    );
  }
}