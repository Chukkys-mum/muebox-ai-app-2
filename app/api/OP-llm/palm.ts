// File Path: app/api/llm/palm.ts

import { NextRequest, NextResponse } from 'next/server';
import llmConfig from '@/config/llm-config.json';
import { fetchWithTimeout } from '@/utils/fetch';

export async function POST(request: NextRequest) {
  try {
    // Parse request JSON
    const { prompt } = await request.json();

    // Validate the prompt
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Locate PALM configuration dynamically
    const palmConfig = llmConfig.models["Specialized Tasks"].find(
      (model: any) => model.name === 'PALM'
    );

    if (!palmConfig) {
      return NextResponse.json(
        { error: 'PALM configuration not found' },
        { status: 404 }
      );
    }

    // Make the API call
    const response = await fetchWithTimeout(palmConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env[palmConfig.keyEnvVariable]}`,
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 300, // Default value
        temperature: 0.7, // Default value
        top_p: 0.9, // Default value
        model: 'palm-2', // Default model
      }),
      timeout: 15000, // Default timeout
    });

    // Handle response errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error('PALM API error:', errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    // Return successful response
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('PALM API call failed:', error.message || error);
    return NextResponse.json(
      { error: 'PALM API call failed' },
      { status: 500 }
    );
  }
}
