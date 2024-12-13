import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Define your public routes
const publicRoutes = [
  '/EmailSignIn',
  '/Signup',
  '/ForgotPassword',
  '/UpdatePassword',
  '/PasswordSignin',
  '/OauthSignIn',
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

// Middleware function
export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  try {
    const pathname = request.nextUrl.pathname;

    // Allow public routes to proceed without authentication
    if (publicRoutes.includes(pathname)) {
      return response;
    }

    // Check if the user is authenticated
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/EmailSignIn', request.url));
    }

    // Allow private routes to proceed if authenticated
    return response;
  } catch (error) {
    console.error('Middleware processing error:', error);
    return NextResponse.next();
  }
}


// Middleware matcher configuration
export const config = {
  matcher: [
    '/dashboard/:path*', // Private routes
    '/EmailSignIn', // Explicitly add other public routes to prevent middleware mismatch
    '/Signup',
    '/ForgotPassword',
    '/UpdatePassword',
    '/PasswordSignin',
    '/OauthSignIn',
  ],
};
