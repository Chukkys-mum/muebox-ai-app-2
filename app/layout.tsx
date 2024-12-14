// app/layout.tsx

import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import SupabaseProvider from './supabase-provider';
import { ThemeProvider } from './theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Loading from './loading';
import '@/styles/globals.css';
import {
  OpenProvider,
  UserProvider,
  UserDetailsProvider,
  PlanProvider,
  ProductsProvider,
  SubscriptionProvider
} from '@/context/layout';

export const dynamic = 'force-dynamic';

// Main root layout with all providers
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Error fetching session:', sessionError);
  }

  return (
    <html lang="en">
      <head>
        <title>Muebox AI - Personalising AI for People and Organisations</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/img/favicon.ico" />
      </head>
      <body className="loading bg-white">
        <Suspense fallback={<Loading />}>
          <SupabaseProvider session={session}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <OpenProvider>
                <UserProvider value={null}>
                  <UserDetailsProvider value={null}>
                    <PlanProvider initialValue={{
                      product: 'prod_default',
                      price: 'price_default'
                    }}>
                      <ProductsProvider value={[]}>
                        <SubscriptionProvider value={null}>
                          {children}
                        </SubscriptionProvider>
                      </ProductsProvider>
                    </PlanProvider>
                  </UserDetailsProvider>
                </UserProvider>
              </OpenProvider>
              <Toaster />
            </ThemeProvider>
          </SupabaseProvider>
        </Suspense>
      </body>
    </html>
  );
}