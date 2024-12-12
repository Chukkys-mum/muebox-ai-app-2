// components/layout/index.tsx

"use client";

import Footer from '@/components/footer/FooterAdmin';
import Navbar from '@/components/navbar/NavbarAdmin';
import { routes } from '@/components/routes';
import Sidebar from '@/components/sidebar/Sidebar';
import { Database } from '@/types/types_db';
import { getActiveRoute } from '@/utils/navigation';
import { User } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

import {
  OpenContext,
  PlanContext,
  ProductsContext,
  SubscriptionContext,
  UserContext,
  UserDetailsContext,
  UserDetails,
  ProductWithPrice,
  SubscriptionWithProduct,
  UserProvider,
  UserDetailsProvider,
  OpenProvider,
  PlanProvider,
  ProductsProvider,
  SubscriptionProvider
} from '@/context/layout';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Price = Database['public']['Tables']['prices']['Row'];

interface Props {
  children: React.ReactNode;
  title?: string;
  description?: string;
  user: User | null | undefined;
  products: ProductWithPrice[];
  subscription: SubscriptionWithProduct | null;
  userDetails: UserDetails | null;
}

const DashboardLayout: React.FC<Props> = (props: Props) => {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [plan, setPlan] = useState({
    product: 'prod_QfhYC6AAtI5IKW',
    price: 'price_1PoM9GDWNoHJSR0zmwpicH8y'
  });

  return (
    <UserProvider value={props.user || null}>
      <UserDetailsProvider value={props.userDetails}>
        <OpenProvider>
          <PlanProvider initialValue={plan}>
            <ProductsProvider value={props.products}>
              <SubscriptionProvider value={props.subscription}>
                <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-background-900">
                  {/* Fixed sidebar */}
                  <div className="fixed left-0 top-0 h-full w-[328px] border-r border-gray-200 dark:border-zinc-800">
                    <Sidebar routes={routes} />
                  </div>
                  
                  {/* Main content area */}
                  <div className="flex flex-1 flex-col pl-[328px]">
                    {/* Fixed navbar at top */}
                    <div className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl dark:bg-zinc-950/80">
                      <Navbar brandText={getActiveRoute(routes, pathname)} />
                    </div>
                    
                    {/* Scrollable content */}
                    <main className="flex-1 overflow-auto px-2.5 pt-[90px] transition-all md:px-2 md:pt-[118px]">
                      <div className="mx-auto">
                        {props.children}
                      </div>
                    </main>
                    
                    {/* Footer */}
                    <div className="p-3">
                      <Footer />
                    </div>
                  </div>
                </div>
              </SubscriptionProvider>
            </ProductsProvider>
          </PlanProvider>
        </OpenProvider>
      </UserDetailsProvider>
    </UserProvider>
  );
};

export default DashboardLayout;
