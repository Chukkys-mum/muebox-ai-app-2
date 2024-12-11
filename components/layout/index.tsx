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
                <div className="dark:bg-background-900 flex h-full w-full bg-white">
                  <Sidebar routes={routes} />
                  <div className="h-full w-full dark:bg-zinc-950">
                    <main
                      className={`mx-2.5 flex-none transition-all dark:bg-zinc-950 md:pr-2 xl:ml-[328px]`}
                    >
                      <div className="mx-auto min-h-screen p-2 !pt-[90px] md:p-2 md:!pt-[118px]">
                        {props.children}
                      </div>
                      <Navbar brandText={getActiveRoute(routes, pathname)} />
                      <div className="p-3">
                        <Footer />
                      </div>
                    </main>
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
