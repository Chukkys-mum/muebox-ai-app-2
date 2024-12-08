// File Path: /pages/api/llm/tongyi-qianwen.ts

import { NextApiRequest, NextApiResponse } from 'next';
import llmConfig from '../../../config/llm-config.json';
import { fetchWithTimeout } from '../../../utils/fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate HTTP method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  // Validate the prompt
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required and must be a string' });
  }

  // Locate Tongyi Qianwen configuration dynamically
  const config = llmConfig.models["Multilingual"].find(
    (model: any) => model.name === 'Tongyi-Qianwen'
  );

  if (!config) {
    return res.status(404).json({ error: 'Tongyi Qianwen configuration not found' });
  }

  try {
    // Make the API call
    const response = await fetchWithTimeout(config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env[config.keyEnvVariable]}`,
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200, // Default value
        temperature: 0.7, // Default value
        top_p: 0.9, // Default value
        n: 1, // Default value
      }),
      timeout: 5000, // Default timeout
    });

    // Handle response errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Tongyi Qianwen API error:', errorData);
      return res.status(response.status).json({ error: errorData });
    }

    // Return successful response
    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Tongyi Qianwen API call failed:', error.message || error);
    res.status(500).json({ error: 'Tongyi Qianwen API call failed' });
  }
}
