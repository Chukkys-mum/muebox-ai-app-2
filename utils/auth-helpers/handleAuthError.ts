// utils/auth-helpers/handleAuthError.ts

import { AuthError } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export function handleAuthError(error: AuthError | Error | null) {
  if (!error) return null;

  if ('status' in error && error.status === 400) {
    switch (error.message) {
      case 'Invalid refresh token':
      case 'refresh_token_already_used':
        return {
          redirect: true,
          path: '/dashboard/signin',
          message: 'Your session has expired. Please sign in again.'
        };
      default:
        return {
          redirect: false,
          message: error.message
        };
    }
  }

  return {
    redirect: false,
    message: 'An unexpected error occurred'
  };
}