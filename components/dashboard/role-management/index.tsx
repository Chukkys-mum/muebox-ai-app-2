// components/dashboard/role-management/index.tsx
'use client';

import RoleListTable, { roleColumns } from '@/components/dashboard/role-management/RoleListTable';
import RoleStatistics from './cards/Statistics';
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
import { RoleRow } from '@/types/tables';

const supabase = createClient();

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

export default function RoleManagementDashboard(props: Props) {
  const { userDetails, user, products = [], subscription = null } = props;
  const router = useRouter();
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    const fetchRoles = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('roles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching roles:', error);
          if (error.code === 'PGRST301') {
            router.push('/signin');
          }
          return;
        }

        if (data) {
          const formattedRoles = data.map((role): RoleRow => ({
            ...role,
            description: role.description || 'No description provided',
            status: role.status || 'inactive',
          }));
          setRoles(formattedRoles);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user, router]);

  // Format products and subscription...
  const formattedProducts: ProductWithPrices[] = products.map((product) => ({
    ...product,
    prices: (product.prices || []).map(price => ({
      ...createDefaultPriceWithProduct(),
      ...price,
      products: createDefaultProduct()
    }))
  }));

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

  if (loading) {
    return (
      <DashboardLayout
        userDetails={userDetails as unknown as User | null}
        user={user ?? null}
        products={formattedProducts}
        subscription={formattedSubscription}
        title="Role Management"
        description="Manage your roles here"
      >
        <div className="flex items-center justify-center h-full">
          Loading roles...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userDetails={userDetails as unknown as User | null}
      user={user ?? null}
      products={formattedProducts}
      subscription={formattedSubscription}
      title="Role Management"
      description="Manage roles and their associated permissions"
    >
      <div className="space-y-6">
        {/* Statistics Section */}
        <div className="p-6">
          <RoleStatistics />
        </div>

        {/* Table Section */}
        <div className="mt-3 h-full w-full">
          <div className="h-full w-full rounded-md">
            <RoleListTable 
              data={roles}
              isLoading={loading}
              config={{
                tableName: 'roles',
                columns: roleColumns,
                baseRoute: '/dashboard/user-management/roles',
                searchableColumns: ['name', 'description', 'status'],
              }}
              onDelete={async (ids: string[]) => {
                try {
                  const { error } = await supabase
                    .from('roles')
                    .delete()
                    .in('id', ids);

                  if (error) throw error;
                  setRoles(roles.filter(role => !ids.includes(role.id)));
                } catch (error) {
                  console.error('Error deleting roles:', error);
                }
              }}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}