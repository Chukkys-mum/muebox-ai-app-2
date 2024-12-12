import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/utils/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User session not found');
        }
        setUser(user);
      } catch (error) {
        logger.error('Authentication error', { error });
        router.push('/dashboard/signin');
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/dashboard/signin');
        }
      }
    );

    fetchUser();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  return { user };
}
