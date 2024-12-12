// app/dashboard/layout.tsx

import { ReactNode } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { createClient } from '@/utils/supabase/server';
import { getActiveProductsWithPrices } from '@/app/supabase-server';

interface LayoutProps {
  children: ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const supabase = await createClient();
  
  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch data in parallel
  const [products, userDetailsResponse, subscriptionResponse] = await Promise.all([
    getActiveProductsWithPrices(),
    await supabase.from('users').select('*').single(),
    await supabase.from('subscriptions')
      .select('*, prices(*, products(*))')
      .in('status', ['trialing', 'active'])
      .single()
  ]);

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetailsResponse?.data}
      products={products}
      subscription={subscriptionResponse?.data}
    >
      {children}
    </DashboardLayout>
  );
}