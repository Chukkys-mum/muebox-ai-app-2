import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Helper to create the Supabase client
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
          // Set cookie in request
          request.cookies.set({
            name,
            value,
          });

          // Set cookie in response with all options
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
          request.cookies.delete(name); // Delete from the request
          response.cookies.set({
            name,
            value: '',
            path: options?.path ?? '/',
            maxAge: -1, // Ensure the cookie is removed
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
          });
        },
        
      },
    }
  );

  return { supabase, response };
};

// Update the session by checking the Supabase user
export const updateSession = async (request: NextRequest) => {
  try {
    const { supabase, response } = createClient(request);
    await supabase.auth.getUser();
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};

// Main middleware function
export function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  try {
    const user = supabase.auth.getUser();

    // Example: Redirect to login if no user is found
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Allow request to proceed
    return response;
  } catch (error) {
    console.error('Middleware processing error:', error);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}

// Middleware configuration
export const config = {
  matcher: ['/dashboard/:path*'], // Define the routes where middleware should apply
};
