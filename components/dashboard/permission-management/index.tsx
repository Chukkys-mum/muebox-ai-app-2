// components/dashboard/permission-management/index.tsx
'use client';

import PermissionListTable, { permissionColumns } from '@/components/dashboard/permission-management/PermissionListTable';
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
import { BaseTableEntity } from '@/types/tables';
import PermissionStatistics from '@/components/dashboard/permission-management/cards/Statistics';

const supabase = createClient();

interface Props {
  user: User | null | undefined;
  userDetails: { [key: string]: any } | null;
  products?: ProductWithPrices[];
  subscription?: SubscriptionWithProduct | null;
}

// Updated Permission interface to match database schema and extend BaseTableEntity
interface Permission extends BaseTableEntity {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  entity_type: string;
  entity_id: string;
  permission_level: string;
  personality_profile_id: string;
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

export default function PermissionManagementDashboard(props: Props) {
  const { userDetails, user, products = [], subscription = null } = props;
  const router = useRouter();
  const [tableData, setTableData] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth state
    if (!user) {
      router.push('/signin');
      return;
    }

    const fetchPermissions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('permission_schemes')
          .select('*')
          .order('created_at', { ascending: false });
    
        if (error) {
          console.error('Error fetching permissions:', error);
          if (error.code === 'PGRST301') {
            router.push('/signin');
          }
          return;
        }
    
        if (data) {
          const formattedPermissions = data.map((permission): Permission => ({
            id: permission.id,
            name: permission.name,
            description: permission.description || 'No description provided',
            status: permission.status || 'inactive',
            created_at: permission.created_at,
            updated_at: permission.updated_at,
            entity_type: permission.entity_type || 'default',
            entity_id: permission.entity_id || '',
            permission_level: permission.permission_level || 'read',
            personality_profile_id: permission.personality_profile_id || '',
          }));
          setTableData(formattedPermissions);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user, router]);

  // Format products to match updated types where prices is required
  const formattedProducts: ProductWithPrices[] = products.map((product) => ({
    ...product,
    prices: (product.prices || []).map(price => ({
      ...createDefaultPriceWithProduct(),
      ...price,
      products: createDefaultProduct() // Changed from price.products to ensure correct typing
    }))
  }));

  // Format subscription to match updated types where prices is required
  const formattedSubscription: SubscriptionWithProduct | null = subscription
    ? {
        ...subscription,
        prices: {
          ...createDefaultPriceWithProduct(),
          ...(subscription.prices || {}),
          products: createDefaultProduct() // Changed from subscription.prices?.products
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
          title="Permission Management"
          description="Manage your permissions here"
        >
          <div className="flex items-center justify-center h-full">
            Loading permissions...
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
        title="Permission Management" 
        description="Manage permission schemes and their associated permissions"
      >
        <div className="space-y-6">
          {/* Statistics Section */}
          <div className="p-6">
            <PermissionStatistics />
          </div>
  
          {/* Table Section */}
          <div className="mt-3 h-full w-full">
            <div className="h-full w-full rounded-md">
              <PermissionListTable 
                data={tableData}
                isLoading={loading}
                config={{
                  tableName: 'permission_schemes',
                  columns: permissionColumns,
                  baseRoute: '/dashboard/user-management/permission-schemes',
                  searchableColumns: ['name', 'description', 'status'],
                }}
                onDelete={async (ids: string[]) => {
                  try {
                    const { error } = await supabase
                      .from('permission_schemes')
                      .delete()
                      .in('id', ids);
  
                    if (error) throw error;
                    setTableData(tableData.filter(permission => !ids.includes(permission.id)));
                  } catch (error) {
                    console.error('Error deleting permissions:', error);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }