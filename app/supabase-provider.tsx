// app/supabase-provider.tsx

'use client';

import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/types_db';
import { useToast } from '@/components/ui/use-toast';
import { AuthError } from '@supabase/supabase-js';

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() => createPagesBrowserClient());
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    async function handleAuthChange(event: string) {
      if (!mounted) return;
      
      if (event === 'SIGNED_OUT') {
        router.push('/dashboard/signin');
      } else if (event === 'SIGNED_IN') {
        router.refresh();
      }
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        router.refresh();
      } else {
        await handleAuthChange(event);
      }

      // Handle auth errors separately from session
      const { error } = await supabase.auth.getSession();
      if (error instanceof AuthError && error.message.includes('refresh_token_already_used')) {
        await supabase.auth.signOut();
        toast({
          title: "Session expired",
          description: "Please sign in again",
          variant: "destructive"
        });
        router.push('/dashboard/signin');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase, toast]);

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider');
  }
  return context;
};