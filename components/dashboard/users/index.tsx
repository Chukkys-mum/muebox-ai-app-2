// /components/dashboard/user-management/index.tsx
'use client';

import UserListTable from '@/components/dashboard/users/UserListTable';
import UserStatistics from './cards/Statistics';  // Changed this import
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
import { UserRow } from '@/types/tables';

const supabase = createClient();

// Column helper
const columnHelper = createColumnHelper<UserRow>();

// Define columns
export const userColumns: ColumnDef<UserRow, any>[] = [
  columnHelper.accessor('name', {
    header: "User Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: "Email",
    cell: (info) => info.getValue(),
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

export default function UserManagementDashboard(props: Props) {
  const { userDetails, user, products = [], subscription = null } = props;
  const router = useRouter();
  const [tableData, setTableData] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth state
    if (!user) {
      router.push('/signin');
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching users:', error);
          if (error.code === 'PGRST301') {
            router.push('/signin');
          }
          return;
        }

        if (data) {
          const formattedUsers = data.map((user): UserRow => ({
            ...user,
            name: user.full_name || 'Unnamed User',
            description: user.username || 'No description provided',
            status: user.status || 'inactive',
            created_at: user.created_at,
            updated_at: user.updated_at,
            email: user.email || '',
            // Add other fields as needed
          }));
          setTableData(formattedUsers);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, router]);

  return (
    <DashboardLayout
      userDetails={userDetails as unknown as User | null}
      user={user ?? null}
      products={products}
      subscription={subscription}
      title="User Management" 
      description="Manage users and their associated data"
    >
      <div className="space-y-6">
        {/* Statistics Section */}
        <div className="p-6">
          <UserStatistics />
        </div>

        {/* Table Section */}
        <div className="mt-3 h-full w-full">
          <div className="h-full w-full rounded-md">
            <UserListTable 
              data={tableData}
              isLoading={loading}
              config={{
                tableName: 'users',
                columns: userColumns,
                baseRoute: '/dashboard/user-management/users',
                searchableColumns: ['name', 'email', 'status'],
              }}
              onDelete={async (ids: string[]) => {
                try {
                  const { error } = await supabase
                    .from('users')
                    .delete()
                    .in('id', ids);

                  if (error) throw error;
                  setTableData(tableData.filter(user => !ids.includes(user.id)));
                } catch (error) {
                  console.error('Error deleting users:', error);
                }
              }}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}