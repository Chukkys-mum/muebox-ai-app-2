// app/dashboard/layout.tsx

import { ReactNode } from 'react';
import DashboardLayoutComponent from '@/components/layout/DashboardLayout';
import { createServerSupabaseClient } from '@/app/supabase-server';
import { getActiveProductsWithPrices } from '@/app/supabase-server';
import {
  UserProvider,
  UserDetailsProvider,
  ProductsProvider,
  SubscriptionProvider
} from '@/context/layout';
import type { Product, PriceWithProduct, SubscriptionWithProduct } from '@/types/subscription';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  
  // Don't apply dashboard layout to auth pages
  if (pathname.includes('/signin') || pathname.includes('/signup')) {
    return children;
  }

  const supabase = await createServerSupabaseClient(); 
  
  // Check authentication
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect('/dashboard/signin');
  }

  // Fetch data in parallel
  const [productsResponse, userDetailsResponse, subscriptionResponse] = await Promise.all([
    getActiveProductsWithPrices(),
    (await supabase).from('users').select('*').single(),
    (await supabase).from('subscriptions')
      .select('*, prices(*, products(*))')
      .in('status', ['trialing', 'active'])
      .single()
  ]);

  const products = productsResponse || [];
  
  // Transform subscription data to match SubscriptionWithProduct type
  const subscription: SubscriptionWithProduct | null = subscriptionResponse?.data
    ? {
        // Subscription base fields
        id: subscriptionResponse.data.id,
        account_id: subscriptionResponse.data.account_id,
        status: subscriptionResponse.data.status,
        metadata: subscriptionResponse.data.metadata,
        price_id: subscriptionResponse.data.price_id,
        quantity: subscriptionResponse.data.quantity,
        cancel_at_period_end: subscriptionResponse.data.cancel_at_period_end,
        created: subscriptionResponse.data.created,
        current_period_start: subscriptionResponse.data.current_period_start,
        current_period_end: subscriptionResponse.data.current_period_end,
        ended_at: subscriptionResponse.data.ended_at,
        cancel_at: subscriptionResponse.data.cancel_at,
        canceled_at: subscriptionResponse.data.canceled_at,
        trial_start: subscriptionResponse.data.trial_start,
        trial_end: subscriptionResponse.data.trial_end,
        credits: subscriptionResponse.data.credits,
        trial_credits: subscriptionResponse.data.trial_credits,

        // Transform prices and products relationship
        prices: subscriptionResponse.data.prices
          ? {
              id: subscriptionResponse.data.prices.id,
              product_id: subscriptionResponse.data.prices.product_id,
              active: subscriptionResponse.data.prices.active,
              description: subscriptionResponse.data.prices.description,
              unit_amount: subscriptionResponse.data.prices.unit_amount,
              currency: subscriptionResponse.data.prices.currency,
              type: subscriptionResponse.data.prices.type,
              interval: subscriptionResponse.data.prices.interval,
              interval_count: subscriptionResponse.data.prices.interval_count,
              trial_period_days: subscriptionResponse.data.prices.trial_period_days,
              metadata: subscriptionResponse.data.prices.metadata,
              account_id: subscriptionResponse.data.prices.account_id,
              products: {
                id: subscriptionResponse.data.prices.products?.id ?? '',
                active: subscriptionResponse.data.prices.products?.active ?? null,
                name: subscriptionResponse.data.prices.products?.name ?? null,
                description: subscriptionResponse.data.prices.products?.description ?? null,
                image: subscriptionResponse.data.prices.products?.image ?? null,
                metadata: subscriptionResponse.data.prices.products?.metadata ?? null
              }
            }
          : null
      }
    : null;
    
  const userDetails = userDetailsResponse?.data || null;

  return (
    <UserProvider value={user}>
      <UserDetailsProvider value={userDetails}>
        <ProductsProvider value={products}>
          <SubscriptionProvider value={subscription}>
            <DashboardLayoutComponent
              user={user}
              userDetails={userDetails}
              products={products}
              subscription={subscription}
            >
              {children}
            </DashboardLayoutComponent>
          </SubscriptionProvider>
        </ProductsProvider>
      </UserDetailsProvider>
    </UserProvider>
  );
}