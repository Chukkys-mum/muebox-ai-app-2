// app/api/login-sessions/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const timeRange = searchParams.get('timeRange') || '1_day';
    const limit = 10;
    const offset = (page - 1) * limit;

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: sessions, error, count } = await supabase
      .from('login_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('last_login', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: sessions,
      meta: {
        totalPages: Math.ceil((count || 0) / limit),
        totalCount: count
      }
    });
  } catch (error) {
    console.error('Error in login-sessions:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}