'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import type { SupabaseClient, User, Session } from '@supabase/supabase-js';
import type { Database } from '@/types/types_db';
import { logger } from '@/utils/logger';

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
  session: Session | null;
  user: User | null;
  account: Database['public']['Tables']['accounts']['Row'] | null;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({ 
  children,
  session: initialSession,
}: { 
  children: React.ReactNode;
  session: Session | null;
}) {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user || null);
  const [account, setAccount] = useState<Database['public']['Tables']['accounts']['Row'] | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAccounts = async (userId: string) => {
      try {
        const { data: accountUsers, error: accountUsersError } = await supabase
          .from('account_users')
          .select('account_id, is_primary')
          .eq('user_id', userId);

        if (accountUsersError) throw accountUsersError;

        if (accountUsers?.length) {
          const accountIds = accountUsers.map((au) => au.account_id);
          const { data: accounts, error: accountsError } = await supabase
            .from('accounts')
            .select('*')
            .in('id', accountIds);

          if (accountsError) throw accountsError;

          setAccount(accounts.find((acc) => acc.is_primary) || accounts[0]);
        }
      } catch (error) {
        logger.error('Error fetching accounts:', { error });
      }
    };

    if (user?.id) fetchAccounts(user.id);
  }, [user, supabase]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);

      if (event === 'SIGNED_IN') router.refresh();
      if (event === 'SIGNED_OUT') {
        setAccount(null);
        router.replace('/dashboard/signin');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <Context.Provider value={{ supabase, session, user, account }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }
  return context;
};
