// /utils/auth-helpers/auth-debug-utility.ts

import { createClient as createServerClient } from '@/utils/supabase/server'
import { createClient as createBrowserClient } from '@/utils/supabase/client'
import { NextResponse } from 'next/server'
import { Database } from '@/types/types_db'

export class AuthDebugger {
  private supabase
  
  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }
    
    // Use server-side client by default
    this.supabase = createServerClient()
  }

  async validateEnvironment() {
    const results = {
      environmentCheck: {
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        nodeEnv: process.env.NODE_ENV
      },
      connection: false,
      auth: false,
      errors: [] as string[]
    }

    try {
      // Test basic connection
      const { data: connectionTest, error: connectionError } = await this.supabase
        .from('users')
        .select('count')
        .limit(1)
      
      results.connection = !connectionError
      if (connectionError) {
        results.errors.push(`Connection error: ${connectionError.message}`)
      }

      // Test auth configuration
      const { data: authTest, error: authError } = await this.supabase.auth.getSession()
      results.auth = !authError
      if (authError) {
        results.errors.push(`Auth error: ${authError.message}`)
      }

    } catch (e) {
      results.errors.push(`Unexpected error: ${e instanceof Error ? e.message : String(e)}`)
    }

    return results
  }

  async testSignUp(email: string, password: string) {
    try {
      // Use browser client for signup
      const browserSupabase = createBrowserClient()
      
      const response = await browserSupabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        }
      })

      return {
        success: !response.error,
        error: response.error?.message,
        data: response.data,
        timestamp: new Date().toISOString()
      }

    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }
    }
  }

  middleware() {
    return async function authMiddleware(req: Request) {
      const res = NextResponse.next()
      const supabase = createServerClient()

      await supabase.auth.getSession()

      return res
    }
  }
}