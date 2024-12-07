// components/dashboard/team-management/cards/TeamStatistics.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Statistics from '@/components/dashboard/shared/Statistics';
import { FiUsers, FiUserPlus, FiUserCheck, FiUserX } from 'react-icons/fi';

const supabase = createClient();

interface TeamStats {
  totalTeams: number;
  activeTeams: number;
  newTeams: number;
  inactiveTeams: number;
}

export default function TeamStatistics() {
  const [stats, setStats] = useState<TeamStats>({
    totalTeams: 0,
    activeTeams: 0,
    newTeams: 0,
    inactiveTeams: 0
  });

  useEffect(() => {
    fetchTeamStats();
  }, []);

  const fetchTeamStats = async () => {
    try {
      const { count: totalCount } = await supabase
        .from('teams')
        .select('*', { count: 'exact' });

      const { count: activeCount } = await supabase
        .from('teams')
        .select('*', { count: 'exact' })
        .eq('status', 'active');

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: newCount } = await supabase
        .from('teams')
        .select('*', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { count: inactiveCount } = await supabase
        .from('teams')
        .select('*', { count: 'exact' })
        .eq('status', 'inactive');

      setStats({
        totalTeams: totalCount || 0,
        activeTeams: activeCount || 0,
        newTeams: newCount || 0,
        inactiveTeams: inactiveCount || 0
      });
    } catch (error) {
      console.error('Error fetching team statistics:', error);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Statistics
        icon={<FiUsers />}
        title="Total Teams"
        value={stats.totalTeams}
        info="All teams in the system"
      />
      <Statistics
        icon={<FiUserCheck />}
        title="Active Teams"
        value={stats.activeTeams}
        info="Currently active teams"
        endContent={
          <span className="text-sm font-medium text-green-500">
            {stats.totalTeams ? 
              Math.round((stats.activeTeams / stats.totalTeams) * 100) : 0}%
          </span>
        }
      />
      <Statistics
        icon={<FiUserPlus />}
        title="New Teams"
        value={stats.newTeams}
        info="Teams created in last 30 days"
      />
      <Statistics
        icon={<FiUserX />}
        title="Inactive Teams"
        value={stats.inactiveTeams}
        info="Currently inactive teams"
        endContent={
          <span className="text-sm font-medium text-red-500">
            {stats.totalTeams ? 
              Math.round((stats.inactiveTeams / stats.totalTeams) * 100) : 0}%
          </span>
        }
      />
    </div>
  );
}