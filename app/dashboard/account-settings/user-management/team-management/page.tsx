// app/dashboard/user-management/team-management/page.tsx
'use client';

import TeamListTable, { teamColumns } from '@/components/dashboard/team-management/TeamListTable';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DashboardLayout from '@/components/layout';
import { TeamRow } from '@/types/tables';

const supabase = createClient();

export default function TeamManagementPage() {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching teams:', error);
          return;
        }

        if (data) {
          // Format the teams data to match TeamRow interface
          const formattedTeams = data.map((team): TeamRow => ({
            ...team,
            description: team.description || 'No description provided',
            name: team.name || `Team ${team.id}`,
            status: team.status || 'inactive',
          }));
          setTeams(formattedTeams);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleDelete = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .in('id', ids);

      if (error) {
        throw error;
      }
      setTeams(teams.filter(team => !ids.includes(team.id)));
    } catch (error) {
      console.error('Error deleting teams:', error);
    }
  };

  return (
    <DashboardLayout
      title="Team Management"
      description="Create, view, and manage teams in your application."
      user={null}
      products={[]}
      subscription={null}
      userDetails={null}
    >
      <div className="p-6">
        <Card className="p-6 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Manage Teams
            </h1>
            <Button
              onClick={() => router.push('/dashboard/user-management/team-management/new')}
              variant="outline"
            >
              New Team
            </Button>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Create, view, and manage teams.
          </p>
          <TeamListTable
            data={teams}
            onDelete={handleDelete}
            isLoading={isLoading}
            config={{
              tableName: 'teams',
              columns: teamColumns,
              baseRoute: '/dashboard/user-management/teams',
              searchableColumns: ['name', 'description', 'status', 'user_id', 'role_id'],
            }}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}