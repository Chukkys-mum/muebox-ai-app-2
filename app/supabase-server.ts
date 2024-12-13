// /app/supabase-server.ts

import { Database } from '@/types/types_db';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { cache } from 'react';

// Create a cached Supabase client instance with correct cookie handling
export const createServerSupabaseClient = cache(async () => {
  try {
    const cookieStore = await cookies(); // Await cookies() to resolve the promise
    const sessionCookie = cookieStore.get('sb-127-auth-token'); // Use .get() after resolution
    if (!sessionCookie) {
      throw new Error('Supabase session cookie missing');
    }
    const session = JSON.parse(sessionCookie.value);
    return createServerComponentClient<Database>({ cookies: () => session });
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw error;
  }
});

// Fetch user details securely
export async function getUserDetails() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: userDetails, error } = await supabase
      .from('users')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
    return userDetails;
  } catch (error) {
    console.error('Critical error in getUserDetails:', error);
    return null;
  }
}

// Securely fetch active session user
export async function getSessionUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: user, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error fetching session user:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Critical error in getSessionUser:', error);
    return null;
  }
}
