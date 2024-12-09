// /utils/supabase/middleware.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export const createClient = (request: NextRequest) => {
  console.log('Creating Supabase client');
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      cookies: {
        get(name: string) {
          console.log(`Getting cookie: ${name}`);
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          console.log(`Setting cookie: ${name}`);
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          console.log(`Removing cookie: ${name}`);
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  return { supabase, response };
};

export async function updateSession(request: NextRequest) {
  console.log('Updating session');
  const { supabase, response } = createClient(request);

  try {
    console.log('Getting session');
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Session error:', error);
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
      return NextResponse.redirect(new URL('/dashboard/signin', request.url));
    }

    console.log('Session retrieved successfully');
    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}