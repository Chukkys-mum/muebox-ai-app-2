// @/utils/supabase/client.ts

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/types_db'

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )
}

// You can also export a default instance if you want
const supabase = createClient()
export default supabase