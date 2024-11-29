// utils/supabase/server.ts

import { Database } from '@/types/types_db';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import https from 'https';

export const createClient = () => {
  console.log('Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Supabase Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        fetch: (url: RequestInfo | URL, init?: RequestInit) => {
          if (process.env.NODE_ENV === 'development') {
            return fetch(url, {
              ...init,
              // @ts-ignore
              agent: new https.Agent({
                rejectUnauthorized: false
              })
            });
          }
          return fetch(url, init);
        }
      },

      cookies: {
        async get(name: string) {
          try {
            const cookieStore = await cookies();
            const cookie = cookieStore.get(name);
            return cookie?.value;
          } catch (error) {
            console.error('Cookie get error:', error);
            return null;
          }
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies();
            await cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.error('Cookie set error:', error);
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies();
            await cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            console.error('Cookie remove error:', error);
          }
        }
      }
    }
  );
};