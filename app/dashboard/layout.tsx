// app/dashboard/layout.tsx

import { ReactNode } from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout';
import { getProductsWithPrices } from '@/utils/supabase/products';
import { getSubscription } from '@/utils/supabase/subscription';
import { cookies } from 'next/headers';
import type { Database } from '@/types/types_db';
import type { ProductWithPrice, SubscriptionWithProduct } from '@/types/subscription';

export default async function DashboardRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Error fetching user:', error.message);
    }

    if (!user) {
      console.log('User not authenticated, redirecting to signin');
      redirect('/dashboard/signin');
    }

    // Fetch additional required data
    const [userDetailsResponse, productsData, subscriptionData] = await Promise.all([
      (await supabase)
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single(),
      getProductsWithPrices(cookieStore),
      getSubscription(cookieStore)
    ]);

    // Transform and type assert the data
    const products = productsData.products as unknown as ProductWithPrice[];
    const subscription = subscriptionData.subscription as unknown as SubscriptionWithProduct | null;
    const userDetails = userDetailsResponse.data;

    return (
      <div className="relative min-h-screen bg-background">
        <DashboardLayout
          user={user}
          userDetails={userDetails}
          products={products}
          subscription={subscription}
        >
          {children}
        </DashboardLayout>
      </div>
    );
  } catch (err) {
    console.error('Unexpected error in DashboardRootLayout:', err);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Hmm.... something went wrong
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Please try refreshing the page
          </p>
        </div>
        <div className="mt-8">
          {children}
        </div>
      </div>
    );
  }
}