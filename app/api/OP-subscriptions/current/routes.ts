// app/api/subscriptions/current/route.ts

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

    // Fetch the user's active or trialing subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        status,
        price_id,
        created,
        current_period_start,
        current_period_end,
        trial_start,
        trial_end,
        prices(
          id,
          currency,
          unit_amount,
          interval,
          interval_count,
          products(
            id,
            name,
            description,
            image,
            metadata
          )
        )
      `)
      .in('status', ['trialing', 'active'])
      .eq('user_id', user.id)
      .maybeSingle();

    // Handle subscription fetch errors
    if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError.message);
      return NextResponse.json(
        { error: 'Failed to fetch subscription details.' },
        { status: 500 }
      );
    }

    // Handle case where no subscription is found
    if (!subscription) {
      return NextResponse.json(
        { error: 'No active or trialing subscription found.' },
        { status: 404 }
      );
    }

    // Return subscription data
    return NextResponse.json({ data: subscription });
  } catch (error) {
    console.error('Unexpected error in subscriptions/current:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
