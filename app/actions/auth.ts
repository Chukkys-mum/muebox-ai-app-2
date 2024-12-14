// app/actions/auth.ts

'use server'

import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/types_db';
import type { CookieOptions } from '@supabase/ssr';

// Cookie handler that returns a Promise
const getCookieStore = () => {
  const cookieStore = cookies();
  return Promise.resolve(cookieStore);
};

export async function handleCookieOperation(
  operation: 'set' | 'remove',
  name: string,
  value?: string,
  opts?: CookieOptions
) {
  try {
    const cookieStore = await getCookieStore();
    
    if (operation === 'set' && value) {
      cookieStore.set(name, value, {
        path: '/',
        sameSite: 'lax',
        secure: typeof window !== 'undefined',
        httpOnly: true,
        ...opts
      });
    } else {
      cookieStore.delete(name);
    }
  } catch (error) {
    console.error(`Cookie operation error: ${error}`);
    throw error;
  }
}

export async function getSupabaseSession() {
  try {
    const supabase = createServerComponentClient<Database>({ 
      cookies: getCookieStore
    });
    return supabase.auth.getSession();
  } catch (error) {
    console.error(`Session error: ${error}`);
    throw error;
  }
}

export async function createServerClient() {
  try {
    const supabase = createServerComponentClient<Database>({
      cookies: getCookieStore
    });
    return supabase;
  } catch (error) {
    console.error(`Client creation error: ${error}`);
    throw error;
  }
}