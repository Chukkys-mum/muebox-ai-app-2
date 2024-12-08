// File Path: /app/api/llm/gpt-j.ts

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

  // Locate GPT-J configuration dynamically
  const gptJConfig = llmConfig.models.Coding.find(
    (model: any) => model.name === 'GPT-J'
  );

  if (!gptJConfig) {
    return res.status(404).json({ error: 'GPT-J configuration not found' });
  }

  try {
    const response = await fetchWithTimeout(gptJConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env[gptJConfig.keyEnvVariable]}`,
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 200, // Default value
        temperature: 0.7, // Default value
        top_p: 0.9, // Default value
        n: 1, // Default number of completions
      }),
      timeout: 5000, // Default timeout
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GPT-J API error:', errorData);
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('GPT-J API call failed:', error.message || error);
    res.status(500).json({ error: 'GPT-J API call failed' });
  }
}
