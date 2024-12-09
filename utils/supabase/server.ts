// /utils/supabase/server.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/types_db';

export const createClient = () => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
            await cookieStore.set(name, value, {
              ...options,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/'
            });
          } catch (error) {
            console.error('Cookie set error:', error);
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies();
            await cookieStore.delete(name);
          } catch (error) {
            console.error('Cookie remove error:', error);
          }
        }
      },
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true,
        debug: process.env.NODE_ENV === 'development'
      }
    }
  );
};

// Separate function to handle token refresh failure
export const handleTokenRefreshFailure = async () => {
  console.error('Token refresh failed');
  const cookieStore = await cookies();
  await cookieStore.delete('sb-access-token');
  await cookieStore.delete('sb-refresh-token');
  // You might want to redirect to login page here
  // or handle this error in your authentication flow
};

export const handleAuthError = async (error: any) => {
  if (error.message.includes('refresh_token_already_used')) {
    console.error('Refresh token already used:', error);
    const supabase = createClient();
    await supabase.auth.signOut();
    // You might want to redirect to login page here
    // or handle this error in your authentication flow
  } else {
    console.error('Authentication error:', error);
  }
};

export const getSession = async () => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    await handleAuthError(error);
    return null;
  }
};

export const refreshSession = async () => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    await handleAuthError(error);
    return null;
  }
};