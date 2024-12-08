// File Path: app/api/llm/command-r.ts

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

    // Locate Command R configuration dynamically
    const commandRConfig = llmConfig.models["Specialized Tasks"].find(
      (model: any) => model.name === 'Command R'
    );

    if (!commandRConfig) {
      return NextResponse.json(
        { error: 'Command R configuration not found' },
        { status: 404 }
      );
    }

    // Make the API call
    const response = await fetchWithTimeout(commandRConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env[commandRConfig.keyEnvVariable]}`,
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 300, // Default to 300 tokens
        temperature: 0.7, // Default to 0.7
        top_p: 0.9, // Default to 0.9
        model: 'command-r-v1', // Default model
      }),
      timeout: 15000, // Default timeout of 15 seconds
    });

    // Handle response errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Command R API error:', errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    // Return successful response
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Command R API call failed:', error.message || error);
    return NextResponse.json(
      { error: 'Command R API call failed' },
      { status: 500 }
    );
  }
}
