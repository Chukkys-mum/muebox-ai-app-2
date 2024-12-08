// File Path: /pages/api/llm/gpt-neo.ts

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

  const gptNeoConfig = llmConfig.models.Coding.find((model) => model.name === 'GPT-Neo');

  if (!gptNeoConfig) {
    return res.status(404).json({ error: 'GPT-Neo configuration not found' });
  }

  try {
    const response = await fetchWithTimeout(gptNeoConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env[gptNeoConfig.keyEnvVariable]}`,
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 200, // Default value (no longer relying on missing property)
        temperature: 0.7, // Default value (no longer relying on missing property)
        top_p: 0.9, // Default value
        n: 1, // Number of completions
      }),
      timeout: 5000, // Default timeout of 5 seconds
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GPT-Neo API error:', errorData);
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('GPT-Neo API call failed:', error.message || error);
    res.status(500).json({ error: 'GPT-Neo API call failed' });
  }
}
