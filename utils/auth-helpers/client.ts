// utils/auth-helpers/client.ts

'use client';

import { getURL } from '@/utils/helpers';
import { createClient } from '@/utils/supabase/client';
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
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
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
  // Prevent default form submission refresh
  e.preventDefault();
  
  // Get form data
  const formData = new FormData(e.currentTarget);
  const provider = String(formData.get('provider')).trim() as Provider;

  // Create client-side supabase client and call signInWithOAuth
  const supabase = createClient();
  const redirectURL = getURL('/auth/callback');
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectURL
      }
    });

    if (error) {
      console.error('OAuth sign in error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('OAuth sign in error:', error);
    // You might want to handle the error more gracefully here
    throw error;
  }
}