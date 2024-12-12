// utils/supabase/middleware.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export const createClient = (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // For request cookies
          request.cookies.set({
            name,
            value
          });

          // For response cookies - Next.js allows additional options here
          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });

          response.cookies.set({
            name,
            value,
            path: options?.path ?? '/',
            maxAge: options?.maxAge ?? 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: ''
          });

          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });

          response.cookies.set({
            name,
            value: '',
            path: options?.path ?? '/',
            maxAge: -1
          });
        }
      }
    }
  );

  return { supabase, response };
};

export const updateSession = async (request: NextRequest) => {
  try {
    const { supabase, response } = createClient(request);
    await supabase.auth.getUser();
    return response;
  } catch (e) {
    console.error('Middleware error:', e);
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }
};