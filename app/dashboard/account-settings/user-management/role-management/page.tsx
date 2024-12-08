// app/dashboard/user-management/role-management/page.tsx
'use client';

import RoleListTable, { roleColumns } from '@/components/dashboard/role-management/RoleListTable';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DashboardWrapper } from '@/components/layout/dashboard-wrapper';
import type { Database } from '@/types/types_db';

const supabase = createClient();

type RoleRow = Database['public']['Tables']['roles']['Row'];

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('roles')
          .select(`
            id,
            name,
            status,
            created_at,
            updated_at,
            permission_scheme_id
          `);

        if (error) {
          console.error('Error fetching roles:', error);
          return;
        }

        if (data) {
          setRoles(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleDelete = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .in('id', ids);

      if (error) {
        throw error;
      }

      setRoles(roles.filter(role => !ids.includes(role.id)));
    } catch (error) {
      console.error('Error deleting roles:', error);
    }
  };

  return (
    <DashboardWrapper
      title="Role Management"
      description="Create, view, and manage roles in your application."
    >
      <div className="p-6">
        <Card className="p-6 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Manage Roles
            </h1>
            <Button
              onClick={() => router.push('/dashboard/user-management/role-management/new')}
              variant="outline"
            >
              New Role
            </Button>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Create, view, and manage roles.
          </p>
          <RoleListTable
            data={roles}
            onDelete={handleDelete}
            isLoading={isLoading}
            config={{
              tableName: 'roles',
              columns: roleColumns,
              baseRoute: '/dashboard/user-management/roles',
              searchableColumns: ['name', 'status'],
            }}
          />
        </Card>
      </div>
    </DashboardWrapper>
  );
}