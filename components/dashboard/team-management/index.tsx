// components/dashboard/team-management/index.tsx
'use client';

import TeamListTable from '@/components/dashboard/team-management/TeamListTable';
import DashboardLayout from '@/components/layout';
import { 
  ProductWithPrices, 
  SubscriptionWithProduct, 
  Price, 
  PriceWithProduct, 
  Product,
  User
} from '@/types/types';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import { TeamRow } from '@/types/tables';
import TeamStatistics from './cards/Statistics';  

const supabase = createClient();

// Column helper
const columnHelper = createColumnHelper<TeamRow>();

// Define columns
export const teamColumns: ColumnDef<TeamRow, any>[] = [
  columnHelper.accessor('name', {
    header: "Team Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('description', {
    header: "Description",
    cell: (info) => info.getValue() || 'No description provided',
  }),
  columnHelper.accessor('status', {
    header: "Status",
    cell: (info) => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        info.getValue() === 'active'
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
      }`}>
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('created_at', {
    header: "Created",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
];

interface Props {
  user: User | null | undefined;
  userDetails: { [key: string]: any } | null;
  products?: ProductWithPrices[];
  subscription?: SubscriptionWithProduct | null;
}

const createDefaultProduct = (): Product => ({
  id: '',
  active: null,
  name: null,
  description: null,
  image: null,
  metadata: null
});

const createDefaultPriceWithProduct = (): PriceWithProduct => ({
  id: '',
  product_id: '',
  active: null,
  currency: null,
  description: null,
  interval: 'month',
  interval_count: null,
  metadata: null,
  trial_period_days: null,
  type: 'recurring',
  unit_amount: null,
  products: createDefaultProduct()
});

export default function TeamManagementDashboard(props: Props) {
  const { userDetails, user, products = [], subscription = null } = props;
  const router = useRouter();
  const [tableData, setTableData] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth state
    if (!user) {
      router.push('/signin');
      return;
    }

    const fetchTeams = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching teams:', error);
          if (error.code === 'PGRST301') {
            router.push('/signin');
          }
          return;
        }

        if (data) {
          const formattedTeams = data.map((team): TeamRow => ({
            ...team,
            description: team.description || 'No description provided',
            status: team.status || 'inactive',
            name: team.name || 'Unnamed Team',
          }));
          setTableData(formattedTeams);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [user, router]);

  // Format products to match updated types where prices is required
  const formattedProducts: ProductWithPrices[] = products.map((product) => ({
    ...product,
    prices: (product.prices || []).map(price => ({
      ...createDefaultPriceWithProduct(),
      ...price,
      products: createDefaultProduct()
    }))
  }));

  // Format subscription to match updated types where prices is required
  const formattedSubscription: SubscriptionWithProduct | null = subscription
    ? {
        ...subscription,
        prices: {
          ...createDefaultPriceWithProduct(),
          ...(subscription.prices || {}),
          products: createDefaultProduct()
        }
      }
    : null;

    return (
      <DashboardLayout
        userDetails={userDetails as unknown as User | null}
        user={user ?? null}
        products={formattedProducts}
        subscription={formattedSubscription}
        title="Team Management" 
        description="Manage teams and their associated members"
      >
        <div className="space-y-6">
          {/* Statistics Section */}
          <div className="p-6">
            <TeamStatistics />
          </div>
  
          {/* Table Section */}
          <div className="mt-3 h-full w-full">
            <div className="h-full w-full rounded-md">
              <TeamListTable 
                data={tableData}
                isLoading={loading}
                config={{
                  tableName: 'teams',
                  columns: teamColumns,
                  baseRoute: '/dashboard/user-management/teams',
                  searchableColumns: ['name', 'description', 'status'],
                }}
                onDelete={async (ids: string[]) => {
                  try {
                    const { error } = await supabase
                      .from('teams')
                      .delete()
                      .in('id', ids);
  
                    if (error) throw error;
                    setTableData(tableData.filter(team => !ids.includes(team.id)));
                  } catch (error) {
                    console.error('Error deleting teams:', error);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }