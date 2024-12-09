// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  try {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    // Handle auth errors
    if (error?.message.includes('refresh_token_already_used')) {
      // Clear auth cookies
      res.cookies.delete('sb-access-token');
      res.cookies.delete('sb-refresh-token');
      
      // Only redirect if trying to access protected routes
      const requestUrl = new URL(request.url);
      if (requestUrl.pathname.startsWith('/dashboard/')) {
        return NextResponse.redirect(new URL('/dashboard/signin', request.url));
      }
    }

    // Check auth for protected routes
    if (!session && request.nextUrl.pathname.startsWith('/dashboard/')) {
      return NextResponse.redirect(new URL('/dashboard/signin', request.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // Clear cookies on critical errors
    res.cookies.delete('sb-access-token');
    res.cookies.delete('sb-refresh-token');
    
    if (request.nextUrl.pathname.startsWith('/dashboard/')) {
      return NextResponse.redirect(new URL('/dashboard/signin', request.url));
    }
    return res;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};