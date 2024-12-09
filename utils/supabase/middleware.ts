// /utils/supabase/middleware.ts

import { createServerClient } from '@supabase/ssr';
import { type NextRequest, type NextResponse } from 'next/server';
import type { Database } from '@/types/types_db';
import type { CookieOptions } from '@supabase/ssr';

export const createMiddlewareClient = (request: NextRequest, response: NextResponse) => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0
          });
        },
      },
      auth: {
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  );
};