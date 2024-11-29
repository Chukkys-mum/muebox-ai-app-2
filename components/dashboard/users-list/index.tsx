/*eslint-disable*/
'use client';

import Statistics from '@/components/dashboard/users-list/cards/Statistics';
import UserListTable from '@/components/dashboard/users-list/cards/UserListTable';
import DashboardLayout from '@/components/layout';
import { Database } from '@/types/types_db';
import tableDataUserReports from '@/variables/tableDataUserReports';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import {
  HiLockClosed,
  HiOutlineWallet,
  HiUserPlus,
  HiUsers
} from 'react-icons/hi2';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Price = Database['public']['Tables']['prices']['Row'];
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null | any;
  userDetails: { [x: string]: any } | null | any;
}

export default function Settings(props: Props) {
  const router = useRouter();

  return (
    <DashboardLayout
      userDetails={props.userDetails}
      user={props.user}
      products={props.products}
      subscription={props.subscription}
      title="Subscription Page"
      description="Manage your subscriptions"
    >
      <div className="mt-3 h-full w-full">
        <div className="mb-5 grid w-full grid-cols-1 gap-5 rounded-md md:grid-cols-2 xl:grid-cols-4">
          {/* statistics */}
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 text-4xl dark:border-zinc-800 dark:text-white">
                <HiUsers className="h-5 w-5" />
              </div>
            }
            title="Total Users"
            value="9,794"
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 text-4xl dark:border-zinc-800 dark:text-white">
                <HiUserPlus className="h-5 w-5" />
              </div>
            }
            title="Users Today"
            value="379"
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 text-4xl dark:border-zinc-800 dark:text-white">
                <HiOutlineWallet className="h-5 w-5 stroke-2" />
              </div>
            }
            title="REST Requests"
            value="270,307"
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 text-4xl dark:border-zinc-800 dark:text-white">
                <HiLockClosed className="h-5 w-5" />
              </div>
            }
            title="Auth Requests"
            value="23,484"
          />
        </div>
        {/* Conversion and talbes*/}
        <div className="h-full w-full rounded-md ">
          <UserListTable tableData={tableDataUserReports} />
        </div>
      </div>
    </DashboardLayout>
  );
}
