// app/dashboard/user-management/permission-management/page.tsx
'use client';

import PermissionListTable, { permissionColumns } from '@/components/dashboard/permission-management/PermissionListTable';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DashboardWrapper } from '@/components/layout/dashboard-wrapper';
import { PermissionRow } from '@/types/tables';
import { Database } from '@/types/types_db';

const supabase = createClient();

type PermissionScheme = Database['public']['Tables']['permission_schemes']['Row'];

export default function PermissionManagementPage() {
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPermissions = async () => {
      setIsLoading(true);
      try {
        const { data, error: supabaseError } = await supabase
          .from('permission_schemes')
          .select()
          .order('created_at', { ascending: false });

        if (supabaseError) {
          setError(supabaseError.message);
          return;
        }

        if (data) {
          const formattedPermissions = data.map((permission): PermissionRow => ({
            id: permission.id,
            name: permission.name,
            description: permission.description || 'No description provided',
            status: permission.status,
            entity_type: 'permission_scheme',
            entity_id: permission.id,
            permission_level: permission.is_super_admin ? 'super_admin' : 'admin',
            personality_profile_id: '',
            created_at: permission.created_at,
            updated_at: permission.updated_at
          }));
          setPermissions(formattedPermissions);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const handleDelete = async (ids: string[]) => {
    try {
      const { error: deleteError } = await supabase
        .from('permission_schemes')
        .delete()
        .in('id', ids);

      if (deleteError) throw deleteError;

      setPermissions(permissions.filter(permission => !ids.includes(permission.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <DashboardWrapper>
      <div className="p-6">
        <Card className="p-6 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Manage Permission Schemes
            </h1>
            <Button
              onClick={() => router.push('/dashboard/user-management/permission-management/new')}
              variant="outline"
            >
              New Permission Scheme
            </Button>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Create, view, and manage permission schemes.
          </p>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-6">
              Error: {error}
            </p>
          )}
          <PermissionListTable
            data={permissions}
            onDelete={handleDelete}
            isLoading={isLoading}
            config={{
              tableName: 'permissions',
              columns: permissionColumns,
              baseRoute: '/dashboard/user-management/permissions',
              searchableColumns: ['name', 'description', 'status', 'entity_type', 'permission_level'],
            }}
          />
        </Card>
      </div>
    </DashboardWrapper>
  );
}