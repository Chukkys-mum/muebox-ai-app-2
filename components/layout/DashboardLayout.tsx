// components/layout/DashboardLayout.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Sidebar from '@/components/sidebar/Sidebar';
import NavbarAdmin from '@/components/navbar/NavbarAdmin';
import { routes } from '@/components/routes';
import { getActiveRoute } from '@/utils/navigation';
import { ProductWithPrice, SubscriptionWithProduct } from '@/types/subscription';
import { User } from '@supabase/supabase-js';
import type { Tables } from '@/types/types_db';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/types_db';

type UserDetails = Tables<'users'>;

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User | null;
  userDetails: UserDetails | null;
  products: ProductWithPrice[];
  subscription: SubscriptionWithProduct | null;
}

export default function DashboardLayout({
  children,
  user,
  userDetails,
  products,
  subscription
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initSupabase = async () => {
      try {
        const client = await createClient();
        setSupabase(client);
      } catch (error) {
        console.error('Error initializing Supabase client:', error);
        router.push('/dashboard/signin');
      } finally {
        setIsLoading(false);
      }
    };

    initSupabase();
  }, [router]);

  useEffect(() => {
    if (!supabase || isLoading) return;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!session || error) {
          router.push('/dashboard/signin');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/dashboard/signin');
      }
    };

    checkAuth();

    const {
      data: { subscription: authSubscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/dashboard/signin');
      }
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, [router, supabase, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>; // You might want to use a proper loading component
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 z-50 h-full w-[280px] border-r border-border">
        <Sidebar routes={routes} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col pl-[280px]">
        {/* Navbar */}
        <div className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl">
          <NavbarAdmin brandText={getActiveRoute(routes, pathname || '')} />
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4">
          <div className="mx-auto max-w-[1200px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}