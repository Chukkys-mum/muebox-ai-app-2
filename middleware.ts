// middleware.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Define your public routes - include all possible auth-related paths
const publicRoutes = [
  '/dashboard/signin',
  '/dashboard/signin/password_signin',
  '/dashboard/signin/email_signin',
  '/dashboard/signup',
  '/dashboard/forgot-password',
  '/dashboard/reset-password',
];

export const createClient = (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          request.cookies.set({ name, value });
          response.cookies.set({
            name,
            value,
            path: options?.path ?? '/',
            maxAge: options?.maxAge ?? 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.delete(name);
          response.cookies.set({
            name,
            value: '',
            path: options?.path ?? '/',
            maxAge: -1,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
          });
        },
      },
    }
  );

  return { supabase, response };
};

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const pathname = request.nextUrl.pathname;

  try {
    // Check if it's a public route
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return response;
    }

    // For dashboard routes, check authentication
    if (pathname.startsWith('/dashboard')) {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        // Redirect to login if not authenticated
        return NextResponse.redirect(new URL('/dashboard/signin', request.url));
      }
    }

    // Allow all other routes to proceed
    return response;
  } catch (error) {
    console.error('Middleware processing error:', error);
    // Redirect to login on error
    return NextResponse.redirect(new URL('/dashboard/signin', request.url));
  }
}

// Update the matcher to catch all relevant paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/((?!_next/static|_next/image|favicon.ico|api|img).*)',
  ],
};