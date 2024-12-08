// app/api/user/current/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch the authenticated user
    const { data: { user }, error } = await supabase.auth.getUser();

    // Handle potential errors or missing user
    if (error) {
      console.error('Error fetching user:', error.message);
      return NextResponse.json(
        { error: 'Failed to fetch user information.' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. No user session found.' },
        { status: 401 }
      );
    }

    // Return the user data
    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Unexpected error in user/current:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
