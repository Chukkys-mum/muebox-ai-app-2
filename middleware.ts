// /middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Always allow access to signin pages
    if (request.nextUrl.pathname.startsWith('/dashboard/signin')) {
      return res;
    }

    // Redirect to signin for other dashboard routes if not authenticated
    if (!session && request.nextUrl.pathname.startsWith('/dashboard/')) {
      return NextResponse.redirect(new URL('/dashboard/signin', request.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return res;
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
};