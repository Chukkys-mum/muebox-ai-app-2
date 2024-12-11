// utils/supabase/client.ts
// import { Database } from '@/types/supabase';

import { Database } from '@/types/types_db';
import { createBrowserClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';

function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return '';
          const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`));
          return cookie ? cookie.split('=')[1] : '';
        },
        set(name: string, value: string, options: CookieOptions) {
          if (typeof document === 'undefined') return;
          let cookie = `${name}=${value}`;
          if (options.maxAge) {
            cookie += `; Max-Age=${options.maxAge}`;
          }
          if (options.domain) {
            cookie += `; Domain=${options.domain}`;
          }
          if (options.path) {
            cookie += `; Path=${options.path}`;
          }
          if (options.sameSite) {
            cookie += `; SameSite=${options.sameSite}`;
          }
          if (options.secure) {
            cookie += '; Secure';
          }
          document.cookie = cookie;
        },
        remove(name: string, options: CookieOptions) {
          if (typeof document === 'undefined') return;
          this.set(name, '', { ...options, maxAge: -1 });
        }
      }
    }
  );
}

// Create a singleton instance
const supabase = createClient();

// Export the singleton instance and the createClient function
export { supabase };
export default createClient;