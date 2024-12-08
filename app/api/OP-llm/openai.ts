// File Path: /api/llm/openai.ts

import { NextApiRequest, NextApiResponse } from 'next';
import llmConfig from '../../../config/llm-config.json';
import { fetchWithTimeout } from '../../../utils/fetch';

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

  // Locate the OpenAI configuration dynamically
  const openaiConfig = llmConfig.models["General-Purpose"].find((model: any) => model.name === 'GPT-4');

  if (!openaiConfig) {
    return res.status(404).json({ error: 'OpenAI configuration not found' });
  }

  try {
    const response = await fetchWithTimeout(openaiConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env[openaiConfig.keyEnvVariable]}`,
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 100, // Default value (no longer relying on missing property)
        temperature: 0.7, // Default value (no longer relying on missing property)
      }),
      timeout: 5000, // Default timeout of 5 seconds
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('OpenAI API call failed:', error.message || error);
    res.status(500).json({ error: 'OpenAI API call failed' });
  }
}
