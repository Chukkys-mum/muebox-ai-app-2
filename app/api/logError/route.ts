// /app/api/logError/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { error, errorInfo } = await request.json();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    const userId = user?.id;

    // Insert into audit_logs table
    const { error: insertError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId || null,
        action: 'error_log',
        entity_type: 'error',
        details: {
          error: error?.message || error,
          stack: error?.stack,
          componentStack: errorInfo?.componentStack,
          metadata: errorInfo
        },
        description: error?.message || 'An error occurred'
      });

    if (insertError) {
      console.error('Error inserting audit log:', insertError);
      return NextResponse.json(
        { error: 'Failed to log error' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in logError:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}