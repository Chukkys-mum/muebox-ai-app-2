// File Path: /pages/api/llm/llama.ts

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

  // Locate LLaMA configuration dynamically
  const llamaConfig = llmConfig.models.Multilingual.find(
    (model: any) => model.name === 'LLaMA'
  );

  if (!llamaConfig) {
    return res.status(404).json({ error: 'LLaMA configuration not found' });
  }

  try {
    const response = await fetchWithTimeout(llamaConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env[llamaConfig.keyEnvVariable]}`,
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 200, // Default to 200 tokens
        temperature: 0.7, // Default to 0.7
        top_p: 0.9, // Default to 0.9
        n: 1, // Default to 1 completion
      }),
      timeout: 5000, // Default timeout of 5 seconds
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LLaMA API error:', errorData);
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('LLaMA API call failed:', error.message || error);
    res.status(500).json({ error: 'LLaMA API call failed' });
  }
}
