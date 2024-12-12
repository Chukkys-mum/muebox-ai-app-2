// app/auth/signout/route.ts

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.redirect(new URL('/auth/signin', request.url));
}