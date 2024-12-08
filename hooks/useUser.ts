// hooks/useUser.ts

import { useState, useEffect } from 'react';
import createClient from '@/utils/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Database } from '@/types/types_db';

type UserDetails = Database['public']['Tables']['users']['Row'];

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user details:', error);
        } else {
          setUserDetails(data);
        }
      }

      setLoading(false);
    }

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      setUser(session?.user ?? null);
      setLoading(true);
      await getUser();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { user, userDetails, loading };
}