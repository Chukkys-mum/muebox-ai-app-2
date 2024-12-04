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
        getAll: () => {
          return document.cookie
            .split('; ')
            .map(cookie => {
              const [name, value] = cookie.split('=');
              return { name, value };
            });
        },
        setAll: (cookies: { name: string; value: string; options: CookieOptions }[]) => {
          cookies.forEach(({ name, value, options }) => {
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
          });
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