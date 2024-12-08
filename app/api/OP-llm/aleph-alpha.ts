// /app/api/llm/aleph-alpha.ts

import { NextApiRequest, NextApiResponse } from 'next';
import llmConfig from '../../../config/llm-config.json';
import { fetchWithTimeout } from '../../../utils/fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required and must be a string' });
  }

  // Locate the Aleph Alpha configuration dynamically
  const alephAlphaConfig = llmConfig.models.Multilingual.find(
    (model) => model.name === 'Aleph Alpha'
  );

  if (!alephAlphaConfig) {
    return res.status(404).json({ error: 'Aleph Alpha configuration not found' });
  }

  try {
    const response = await fetchWithTimeout(alephAlphaConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env[alephAlphaConfig.keyEnvVariable]}`,
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 1000, // Default values if not in config
        temperature: 0.7,
        top_p: 1.0,
        n: 1,
      }),
      timeout: 15000, // Default timeout (can be configurable)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Aleph Alpha API error:', errorData);
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Aleph Alpha API call failed:', error.message || error);
    res.status(500).json({ error: 'Aleph Alpha API call failed' });
  }
}
