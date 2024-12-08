// app/dashboard/user-management/users/page.tsx
'use client';

import UserListTable, { userColumns } from '@/components/dashboard/users/UserListTable';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DashboardLayout from '@/components/layout';
import { UserRow } from '@/types/tables';

const supabase = createClient();

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching users:', error);
          return;
        }

        if (data) {
          const formattedUsers = data.map((user): UserRow => ({
            ...user,
            id: user.id,
            name: user.full_name || 'Unnamed User',
            description: user.username || 'No description provided',
            status: user.status || 'inactive',
            created_at: user.created_at,
            updated_at: user.updated_at,
            email: user.email || '',
            avatar_url: user.display_picture || '',
            credits: user.credits || 0,
            billing_address: user.billing_address || null,
            payment_method: user.payment_method || null,
            username: user.username || '',
            company_id: user.company_id || '',
            role_id: user.role_id || '',
            personality_profile_id: user.personality_profile_id || '',
          }));
          setUsers(formattedUsers);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .in('id', ids);

      if (error) {
        throw error;
      }
      setUsers(users.filter(user => !ids.includes(user.id)));
    } catch (error) {
      console.error('Error deleting users:', error);
    }
  };

  return (
    <DashboardLayout
      title="User Management"
      description="Create, view, and manage users in your application."
      user={null}
      products={[]}
      subscription={null}
      userDetails={null}
    >
      <div className="p-6">
        <Card className="p-6 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Manage Users
            </h1>
            <Button
              onClick={() => router.push('/dashboard/user-management/users/new')}
              variant="outline"
            >
              New User
            </Button>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Create, view, and manage users.
          </p>
          <UserListTable
            data={users}
            onDelete={handleDelete}
            isLoading={isLoading}
            config={{
              tableName: 'users',
              columns: userColumns,
              baseRoute: '/dashboard/user-management/users',
              searchableColumns: ['name', 'username', 'email', 'status', 'role_id'],
            }}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}