// /app/auth/callback/route.ts

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return NextResponse.redirect(
          getErrorRedirect(
            `${requestUrl.origin}/dashboard/signin`,
            error.name,
            "Authentication failed. Please try again."
          )
        );
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/dashboard/signin`,
          'AuthError',
          "An unexpected error occurred. Please try again."
        )
      );
    }
  }

  return NextResponse.redirect(
    getStatusRedirect(
      `${requestUrl.origin}/dashboard/main`,
      'Success!',
      'You are now signed in.'
    )
  );
}