// /utils/supabase/session.ts
import { cookies } from 'next/headers';
import { createClient } from './server';

export async function getUser(cookieStore: ReturnType<typeof cookies>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user };
}