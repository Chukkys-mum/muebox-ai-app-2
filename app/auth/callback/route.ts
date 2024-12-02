// /app/auth/callback/route.ts

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const error = requestUrl.searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(
      getErrorRedirect(
        `${requestUrl.origin}/dashboard/signin`,
        error || 'No authorization code received',
        "Sorry, we weren't able to log you in. Please try again."
      )
    );
  }

  const supabase = createClient();

  // Exchange code for session (existing functionality)
  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

  if (sessionError) {
    return NextResponse.redirect(
      getErrorRedirect(
        `${requestUrl.origin}/dashboard/signin`,
        sessionError.name,
        "Sorry, we weren't able to log you in. Please try again."
      )
    );
  }

  // New functionality for email provider authentication
  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Authentication required');
    }

    // Check if this is an email provider callback
    if (state && (state.includes('microsoft') || state.includes('gmail'))) {
      // Exchange the authorization code for tokens
      const provider = state.includes('microsoft') ? 'outlook' : 'gmail';
      const tokenEndpoint = provider === 'outlook' 
        ? 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
        : 'https://oauth2.googleapis.com/token';

      const tokenResponse = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: provider === 'outlook'
            ? process.env.MICROSOFT_CLIENT_ID!
            : process.env.GOOGLE_CLIENT_ID!,
          client_secret: provider === 'outlook'
            ? process.env.MICROSOFT_CLIENT_SECRET!
            : process.env.GOOGLE_CLIENT_SECRET!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange authorization code for tokens');
      }

      const tokens = await tokenResponse.json();

      // Get user email address
      let emailAddress = '';
      if (provider === 'gmail') {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });
        const userInfo = await userInfoResponse.json();
        emailAddress = userInfo.email;
      } else {
        const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });
        const userInfo = await userInfoResponse.json();
        emailAddress = userInfo.userPrincipalName;
      }

      // Store email account in database
      const { error: insertError } = await supabase
        .from('email_accounts')
        .insert({
          user_id: user.id,
          provider,
          email_address: emailAddress,
          status: 'active',
        });

      if (insertError) {
        throw new Error('Failed to store email account');
      }

      // Store tokens securely
      const { error: tokenError } = await supabase
        .from('user_api_keys')
        .insert({
          user_id: user.id,
          llm_id: provider,
          api_key: JSON.stringify({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: Date.now() + tokens.expires_in * 1000,
          }),
        });

      if (tokenError) {
        throw new Error('Failed to store tokens');
      }

      return NextResponse.redirect(
        getStatusRedirect(
          `${requestUrl.origin}/settings/email`,
          'Success!',
          'Email account connected successfully.'
        )
      );
    }

    // If it's not an email provider callback, proceed with the original redirect
    return NextResponse.redirect(
      getStatusRedirect(
        `${requestUrl.origin}/dashboard/main`,
        'Success!',
        'You are now signed in.'
      )
    );

  } catch (err: unknown) {
    console.error('OAuth callback error:', err);
    let errorMessage = 'An unexpected error occurred';
    
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    
    return NextResponse.redirect(
      getErrorRedirect(
        `${requestUrl.origin}/settings/email`,
        'Error',
        errorMessage
      )
    );
  }
}