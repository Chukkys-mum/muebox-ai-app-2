// utils/auth-helpers/client.ts

'use client';

import { getURL } from '@/utils/helpers';
import { createClient } from '@/utils/supabase/client'; // Ensure single import
import { type Provider } from '@supabase/supabase-js';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { redirectToPath } from './server';

export async function handleRequest(
  e: React.FormEvent<HTMLFormElement>,
  requestFunc: (formData: FormData) => Promise<string>,
  router: AppRouterInstance | null = null
): Promise<boolean | void> {
  try {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const redirectUrl: string = await requestFunc(formData);

    console.log('Redirect URL:', redirectUrl);

    if (router) {
      return router.push(redirectUrl);
    } else {
      window.location.href = redirectUrl;
      return;
    }
  } catch (error) {
    console.error('Request handling error:', error);
    const errorUrl = '/dashboard/signin/signup?error=Sign up failed.&error_description=An unexpected error occurred';

    if (router) {
      return router.push(errorUrl);
    } else {
      window.location.href = errorUrl;
      return;
    }
  }
}

export async function signInWithOAuth(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const provider = String(formData.get('provider')).trim() as Provider;

  const supabase = createClient(); // Use the correct client
  const redirectURL = getURL('/auth/callback');
  await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: redirectURL,
    },
  });
}


