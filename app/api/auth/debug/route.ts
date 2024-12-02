// app/auth/debug/route.ts
import { AuthDebugger as AuthDebugUtil } from '@/utils/auth-helpers/auth-debug-utility'
import { NextResponse } from 'next/server'

export async function GET() {
  const authDebug = new AuthDebugUtil(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const results = await authDebug.validateEnvironment()
  return NextResponse.json(results)
}