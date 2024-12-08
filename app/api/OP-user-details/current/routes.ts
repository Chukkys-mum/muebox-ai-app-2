// app/api/user-details/current/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // Handle authentication errors
    if (userError) {
      console.error('Error fetching user from Supabase auth:', userError.message);
      return NextResponse.json(
        { error: 'Failed to fetch authenticated user.' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. No user session found.' },
        { status: 401 }
      );
    }

    // Fetch user details from the 'users' table
    const { data: userDetails, error: detailsError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        avatar_url,
        credits,
        billing_address,
        payment_method,
        username,
        email,
        company_id,
        display_picture,
        status,
        created_at,
        updated_at,
        personality_profile_id,
        role_id
      `)
      .eq('id', user.id)
      .single();

    // Handle errors fetching user details
    if (detailsError) {
      console.error('Error fetching user details from database:', detailsError.message);
      return NextResponse.json(
        { error: 'Failed to fetch user details.' },
        { status: 500 }
      );
    }

    // Validate and return user details
    if (!userDetails) {
      console.error('User details not found for user ID:', user.id);
      return NextResponse.json(
        { error: 'User details not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: userDetails });
  } catch (error) {
    console.error('Unexpected error in user-details/current:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
