// /app/auth/callback/route.ts

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EmailProviderFactory, ProviderType } from '@/services/email/providers/ProviderFactory';

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(
      `/settings/email?error=${encodeURIComponent(error || 'No authorization code received')}`
    );
  }

  try {
    const cookieStore = cookies();
    const supabase = createClient();

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Authentication required');
    }

    // Determine the provider
    const providerType: ProviderType = state?.includes('microsoft') ? 'outlook' : 'gmail';

    // Create provider instance
    const provider = EmailProviderFactory.getProvider(providerType, {
      clientId: providerType === 'outlook'
        ? process.env.MICROSOFT_CLIENT_ID!
        : process.env.GOOGLE_CLIENT_ID!,
      clientSecret: providerType === 'outlook'
        ? process.env.MICROSOFT_CLIENT_SECRET!
        : process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      scopes: providerType === 'outlook'
        ? ['Mail.Read', 'Mail.Send', 'User.Read']
        : ['https://mail.google.com/', 'https://www.googleapis.com/auth/userinfo.email']
    });

    // Exchange the authorization code for tokens
    const tokens = await provider.exchangeCodeForTokens(code);

    // Get user email address
    const emailAddress = await provider.getUserEmail(tokens.accessToken);

    // Store email account in database
    const { data: accountData, error: insertError } = await supabase
      .from('email_accounts')
      .insert({
        user_id: user.id,
        provider: providerType,
        email_address: emailAddress,
        status: 'active',
      })
      .select()
      .single();

    if (insertError) {
      throw new Error('Failed to store email account');
    }

    // Store tokens securely
    const { error: tokenError } = await supabase
      .from('user_api_keys')
      .insert({
        user_id: user.id,
        llm_id: providerType,
        api_key: JSON.stringify({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
        }),
      });

    if (tokenError) {
      throw new Error('Failed to store tokens');
    }

    // Initialize real-time sync for the new account
    if (accountData) {
      const { realTimeSyncService } = await import('@/services/email/RealTimeSyncService');
      await realTimeSyncService.startSync(user.id);
      await realTimeSyncService.triggerAccountSync(accountData.id);
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/settings/email?success=${encodeURIComponent('Account connected successfully')}`
    );

  } catch (error: unknown) {
    console.error('OAuth callback error:', error);
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/settings/email?error=${encodeURIComponent(errorMessage)}`
    );
  }
}