// app/api/activity-log.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { fetchActivityLogs } from '@/utils/supabase/queries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = createServerSupabaseClient({ req, res });
    
    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({
        error: 'Unauthorized'
      });
    }

    const { page = 1, timeRange = '1_day' } = req.query;
    const limit = 10;
    const offset = (Number(page) - 1) * limit;

    const { data, error } = await fetchActivityLogs(
      supabase,
      session.user.id,
      { limit, offset }
    );

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in activity-log API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}