// utils/supabase/server.ts

import { Database } from '@/types/types_db';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import https from 'https';
import { logger } from '@/utils/logger';

export async function createClient() {
  try {
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const client = createServerClient<Database>(
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
          get(name: string) {
            return cookieStore.get(name)?.value ?? '';
          },
          set(name: string, value: string, options?: CookieOptions) {
            try {
              cookieStore.set({
                name,
                value,
                ...options,
                ...(name.startsWith('sb-') && {
                  secure: process.env.NODE_ENV === 'production',
                  httpOnly: true,
                  sameSite: 'lax',
                  path: '/'
                })
              });
            } catch (error) {
              logger.error('Error setting cookie:', { error, name });
            }
          },
          remove(name: string, options?: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options, maxAge: 0 });
            } catch (error) {
              logger.error('Error removing cookie:', { error, name });
            }
          }
        }
      }
    );

    return client;
  } catch (error) {
    logger.error('Error creating Supabase client:', { error });
    throw error;
  }
}

export async function getAccountFromUser(userId: string) {
  try {
    const supabase = await createClient();

    const { data: accountUsers, error: accountError } = await supabase
      .from('account_users')
      .select('account_id')
      .eq('user_id', userId);

    if (accountError) throw accountError;

    if (accountUsers?.length) {
      const accountIds = accountUsers.map((au) => au.account_id);
      const { data: accounts, error: accountDetailsError } = await supabase
        .from('accounts')
        .select('*')
        .in('id', accountIds);

      if (accountDetailsError) throw accountDetailsError;

      // Default to the first account if there’s no 'is_primary' property
      return accounts[0];
    }

    return null;
  } catch (error) {
    logger.error('Error fetching account details:', { error });
    return null;
  }
}

