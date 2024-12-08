// File Path: /api/llm/jasper.ts

import { NextApiRequest, NextApiResponse } from 'next';
import llmConfig from '../../../config/llm-config.json';
import { fetchWithTimeout } from '../../../utils/fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate the HTTP method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  // Validate the prompt
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required and must be a string' });
  }

  // Locate Jasper configuration dynamically
  const jasperConfig = llmConfig.models["Content Creation"].find(
    (model: any) => model.name === 'Jasper'
  );

  if (!jasperConfig) {
    return res.status(404).json({ error: 'Jasper configuration not found' });
  }

  try {
    // Provide fallback values directly in the request payload
    const response = await fetchWithTimeout(jasperConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env[jasperConfig.keyEnvVariable]}`,
      },
      body: JSON.stringify({
        input: prompt,
        max_tokens: 200, // Default fallback value
        temperature: 0.7, // Default fallback value
        top_p: 0.9, // Default fallback value
        n: 1, // Default fallback value
      }),
      timeout: 5000, // Default timeout
    });

    // Handle response errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Jasper API error:', errorData);
      return res.status(response.status).json({ error: errorData });
    }

    // Return successful response
    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Jasper API call failed:', error.message || error);
    res.status(500).json({ error: 'Jasper API call failed' });
  }
}
