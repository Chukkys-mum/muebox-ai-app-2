// app/api/llm/openassistant.ts

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

  // Locate the OpenAssistant configuration dynamically
  const openAssistantConfig = llmConfig.models.Conversation.find(
    (model) => model.name === 'OpenAssistant'
  );

  if (!openAssistantConfig) {
    return res.status(404).json({ error: 'OpenAssistant configuration not found' });
  }

  try {
    const response = await fetchWithTimeout(openAssistantConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env[openAssistantConfig.keyEnvVariable]}`,
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 200, // Default value (no longer relying on missing property)
        temperature: 0.7, // Default value (no longer relying on missing property)
        top_p: 1.0, // Default value (no longer relying on missing property)
        n: 1, // Default value (no longer relying on missing property)
      }),
      timeout: 15000, // Default value (no longer relying on missing property)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAssistant API error:', errorData);
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('OpenAssistant API call failed:', error.message || error);
    res.status(500).json({ error: 'OpenAssistant API call failed' });
  }
}
