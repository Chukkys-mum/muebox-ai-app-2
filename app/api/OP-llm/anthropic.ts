// File Path: app/api/llm/anthropic.ts

import { NextApiRequest, NextApiResponse } from 'next';
import type { LLMConfig, LLMModel } from '@/types/llmConfig'; // Use the shared types
import llmConfig from '@/config/llm-config.json';
import { fetchWithTimeout } from '@/utils/fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  // Validate prompt
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required and must be a string' });
  }

  // Dynamically find the Anthropic configuration
  const anthropicConfig: LLMModel | undefined = llmConfig.models.Conversation.find(
    (model) => model.name === 'Claude'
  );

  if (!anthropicConfig) {
    console.error('Anthropic configuration not found in llm-config.json');
    return res.status(500).json({ error: 'Anthropic configuration not found' });
  }

  try {
    const response = await fetchWithTimeout(anthropicConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env[anthropicConfig.keyEnvVariable]}`,
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 100, // Default or customizable
        temperature: 0.7, // Default or customizable
      }),
      timeout: 5000, // Default timeout of 5 seconds
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API error:', errorData);
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Anthropic API call failed:', error.message || error);
    res.status(500).json({ error: 'Anthropic API call failed' });
  }
}
