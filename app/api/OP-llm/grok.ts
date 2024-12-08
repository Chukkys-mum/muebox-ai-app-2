// File Path: app/api/llm/grok.ts

import { NextApiRequest, NextApiResponse } from 'next';
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

  // Locate the Grok configuration dynamically
  const grokConfig = llmConfig.models['Conversation'].find(
    (model) => model.name === 'Grok'
  );

  if (!grokConfig) {
    console.error('Grok configuration not found in llm-config.json');
    return res.status(500).json({ error: 'Grok configuration not found' });
  }

  // Retrieve the API key
  const apiKey = process.env[grokConfig.keyEnvVariable];
  if (!apiKey) {
    console.error('Grok API key is missing from environment variables');
    return res.status(500).json({ error: 'API key is missing from environment variables' });
  }

  try {
    const response = await fetchWithTimeout(grokConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 200, // Default to 200 tokens
        temperature: 0.7, // Default temperature
      }),
      timeout: 5000, // Default timeout of 5 seconds
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Grok API error:', errorData);
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Grok API call failed:', error.message || error);
    res.status(500).json({ error: 'Grok API call failed' });
  }
}
