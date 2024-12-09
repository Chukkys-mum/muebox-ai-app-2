// /app/supabase-provider.tsx

'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/types_db';
import { useToast } from '@/components/ui/use-toast';

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() => 
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true
        }
      }
    )
  );
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT') {
        router.refresh();
      }

      // Handle auth errors
      if (event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        const { error } = await supabase.auth.getSession();
        if (error?.message.includes('refresh_token_already_used')) {
          await supabase.auth.signOut();
          toast({
            title: "Session expired",
            description: "Please sign in again",
            variant: "destructive"
          });
          router.push('/dashboard/signin');
        }
      }
    });

    return () => {
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