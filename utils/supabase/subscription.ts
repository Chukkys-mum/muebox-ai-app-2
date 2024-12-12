// /utils/supabase/subscription.ts

import { cookies } from 'next/headers';
import { createClient } from './server';

export async function getSubscription(cookieStore: ReturnType<typeof cookies>) {
  const supabase = await createClient();
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .single();
  return { subscription };
}