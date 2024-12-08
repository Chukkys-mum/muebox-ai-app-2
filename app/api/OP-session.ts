// /pages/api/session.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Parse cookies from the incoming request
    const cookieHeader = req.headers.cookie || ''; // Get cookies from headers
    const cookies = parse(cookieHeader); // Use 'cookie' library to parse
    const sessionId = cookies['sessionId']; // Replace 'sessionId' with your cookie's key if different

    // Handle missing session ID
    if (!sessionId) {
      return res.status(404).json({ error: 'Session ID not found' });
    }

    // Respond with the session ID
    return res.status(200).json({ sessionId });
  } catch (error) {
    console.error('Error retrieving session ID:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
