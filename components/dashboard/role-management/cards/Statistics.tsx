// components/dashboard/role-management/cards/UserStatistics.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Statistics from '@/components/dashboard/shared/Statistics';
import { FiUsers, FiUserPlus, FiUserCheck, FiUserX } from 'react-icons/fi';

const supabase = createClient();

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  inactiveUsers: number;
}

export default function UserStatistics() {
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    inactiveUsers: 0
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      // Get total users
      const { count: totalCount } = await supabase
        .from('users')
        .select('*', { count: 'exact' });

      // Get active users
      const { count: activeCount } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('status', 'active');

      // Get new users (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: newCount } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Get inactive users
      const { count: inactiveCount } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('status', 'inactive');

      setStats({
        totalUsers: totalCount || 0,
        activeUsers: activeCount || 0,
        newUsers: newCount || 0,
        inactiveUsers: inactiveCount || 0
      });
    } catch (error) {
      console.error('Error fetching user statistics:', error);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Statistics
        icon={<FiUsers />}
        title="Total Users"
        value={stats.totalUsers}
        info="All registered users"
      />
      <Statistics
        icon={<FiUserCheck />}
        title="Active Users"
        value={stats.activeUsers}
        info="Currently active users"
        endContent={
          <span className="text-sm font-medium text-green-500">
            {stats.totalUsers ? 
              Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
          </span>
        }
      />
      <Statistics
        icon={<FiUserPlus />}
        title="New Users"
        value={stats.newUsers}
        info="Users joined in last 30 days"
        endContent={
          <span className="text-sm font-medium text-blue-500">
            Last 30 days
          </span>
        }
      />
      <Statistics
        icon={<FiUserX />}
        title="Inactive Users"
        value={stats.inactiveUsers}
        info="Currently inactive users"
        endContent={
          <span className="text-sm font-medium text-red-500">
            {stats.totalUsers ? 
              Math.round((stats.inactiveUsers / stats.totalUsers) * 100) : 0}%
          </span>
        }
      />
    </div>
  );
}