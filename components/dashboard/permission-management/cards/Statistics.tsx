// components/dashboard/permission-management/cards/PermissionStatistics.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Statistics from '@/components/dashboard/shared/Statistics';
import { FiKey, FiLock, FiPlus, FiSlash } from 'react-icons/fi';

const supabase = createClient();

interface PermissionStats {
 totalPermissions: number;
 activePermissions: number;
 newPermissions: number;
 inactivePermissions: number;
}

export default function PermissionStatistics() {
 const [stats, setStats] = useState<PermissionStats>({
   totalPermissions: 0,
   activePermissions: 0,
   newPermissions: 0,
   inactivePermissions: 0
 });

 useEffect(() => {
   fetchPermissionStats();
 }, []);

 const fetchPermissionStats = async () => {
   try {
     // Get total permissions
     const { count: totalCount } = await supabase
       .from('permissions')
       .select('*', { count: 'exact' });

     // Get active permissions
     const { count: activeCount } = await supabase
       .from('permissions')
       .select('*', { count: 'exact' })
       .eq('status', 'active');

     // Get new permissions (last 30 days)
     const thirtyDaysAgo = new Date();
     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
     const { count: newCount } = await supabase
       .from('permissions')
       .select('*', { count: 'exact' })
       .gte('created_at', thirtyDaysAgo.toISOString());

     // Get inactive permissions
     const { count: inactiveCount } = await supabase
       .from('permissions')
       .select('*', { count: 'exact' })
       .eq('status', 'inactive');

     setStats({
       totalPermissions: totalCount || 0,
       activePermissions: activeCount || 0,
       newPermissions: newCount || 0,
       inactivePermissions: inactiveCount || 0
     });
   } catch (error) {
     console.error('Error fetching permission statistics:', error);
   }
 };

 return (
   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
     <Statistics
       icon={<FiKey />}
       title="Total Permissions"
       value={stats.totalPermissions}
       info="All system permissions"
     />
     <Statistics
       icon={<FiLock />}
       title="Active Permissions"
       value={stats.activePermissions}
       info="Currently active permissions"
       endContent={
         <span className="text-sm font-medium text-green-500">
           {stats.totalPermissions ? 
             Math.round((stats.activePermissions / stats.totalPermissions) * 100) : 0}%
         </span>
       }
     />
     <Statistics
       icon={<FiPlus />}
       title="New Permissions"
       value={stats.newPermissions}
       info="Permissions created in last 30 days"
       endContent={
         <span className="text-sm font-medium text-blue-500">
           Last 30 days
         </span>
       }
     />
     <Statistics
       icon={<FiSlash />}
       title="Inactive Permissions"
       value={stats.inactivePermissions}
       info="Currently inactive permissions"
       endContent={
         <span className="text-sm font-medium text-red-500">
           {stats.totalPermissions ? 
             Math.round((stats.inactivePermissions / stats.totalPermissions) * 100) : 0}%
         </span>
       }
     />
   </div>
 );
}