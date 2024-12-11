// app/dashboard/layout.tsx

import DashboardLayout from '@/components/layout';
import {
  getProducts,
  getSubscription,
  getUser,
  getUserDetails
} from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';
import { adaptProductWithPrices, adaptSubscriptionWithProduct } from '@/types/adapters';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default async function DashboardRootLayout({
  children
}: {
  children: ReactNode;
}) {
  const supabase = createClient();

  try {
    const [user, userDetails, dbProducts, dbSubscription] = await Promise.all([
      getUser(supabase),
      getUserDetails(supabase),
      getProducts(supabase),
      getSubscription(supabase)
    ]);

    if (!user) {
      return redirect('/dashboard/signin');
    }

    // Convert the types using adapters
    const products = dbProducts?.map(adaptProductWithPrices) || [];
    const subscription = dbSubscription ? adaptSubscriptionWithProduct(dbSubscription) : null;

    return (
      <DashboardLayout
        user={user}
        products={products}
        subscription={subscription}
        userDetails={userDetails}
      >
        {children}
      </DashboardLayout>
    );
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return redirect('/dashboard/error');
  }
}