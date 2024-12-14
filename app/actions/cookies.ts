// /app/actions/cookies.ts

'use server'

import { cookies } from 'next/headers';
import type { CookieOptions } from '@supabase/ssr';

export async function setCookie(name: string, value: string, options?: CookieOptions) {
  const cookieStore = await cookies();
  try {
    cookieStore.set({
      name,
      value,
      ...options,
      ...(name.startsWith('sb-') && {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        path: '/'
      })
    });
  } catch (error) {
    console.error('Error setting cookie:', error);
  }
}

export async function removeCookie(name: string, options?: CookieOptions) {
  const cookieStore = await cookies();
  try {
    cookieStore.set({ 
      name, 
      value: '', 
      ...options, 
      maxAge: 0 
    });
  } catch (error) {
    console.error('Error removing cookie:', error);
  }
}