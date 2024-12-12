// /components/sidebar/Sidebar.tsx

'use client';

import { useEffect, useState } from 'react';
import {
  renderThumb,
  renderTrack,
  renderView
} from '@/components/scrollbar/Scrollbar';
import Links from '@/components/sidebar/components/Links';
import SidebarCard from '@/components/sidebar/components/SidebarCard';
import { Card } from '@/components/ui/card';
import { IRoute } from '@/types/ui';
import type { Database } from '@/types/types_db';
import { HiBolt } from 'react-icons/hi2';
import { Scrollbars } from 'react-custom-scrollbars-2';
import useMediaQuery from '@/hooks/useMediaQuery';
import { useSupabase } from '@/app/supabase-provider';
import { useRouter } from 'next/navigation';
import { logger } from '@/utils/logger';

const NAVBAR_HEIGHT = '64px';

interface SidebarProps {
  routes: IRoute[];
}

export default function Sidebar({ routes }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<
    Database['public']['Tables']['accounts']['Row'][] | null
  >(null);
  const [currentAccount, setCurrentAccount] = useState<
    Database['public']['Tables']['accounts']['Row'] | null
  >(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { supabase, user } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user?.id) return; // Ensure user ID is defined
      try {
        const { data: accountUsers } = await supabase
          .from('account_users')
          .select('account_id, is_primary')
          .eq('user_id', user.id);

        if (accountUsers?.length) {
          const accountIds = accountUsers.map((au) => au.account_id);
          const { data: accounts } = await supabase
            .from('accounts')
            .select('*')
            .in('id', accountIds);
          setAccounts(accounts || null);
          setCurrentAccount(
            accounts?.find((acc) =>
              accountUsers.some((au) => au.account_id === acc.id && au.is_primary)
            ) || accounts?.[0] || null
          );
        }
      } catch (error) {
        logger.error('Error fetching accounts:', { error });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, [supabase, user]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <aside
      className={`fixed left-0 transition-all duration-300 z-[99] min-h-full
        ${collapsed ? 'w-20' : 'w-64'}
        ${isMobile ? 'lg:flex' : 'flex'}`}
      style={{
        top: NAVBAR_HEIGHT,
        height: `calc(100vh - ${NAVBAR_HEIGHT})`
      }}
    >
      <Card
        className="relative flex flex-col w-full overflow-hidden rounded-none border-r
          border-zinc-200 dark:border-zinc-800 bg-[#242424] dark:bg-[#0f1117]"
      >
        <div className="flex items-center justify-center p-4">
          <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <HiBolt className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div>
                <h5 className="ml-3 text-xl font-bold text-white dark:text-white">
                  {currentAccount?.name || 'Horizon AI'}
                </h5>
              </div>
            )}
          </div>
        </div>
        <Scrollbars
          autoHide
          renderTrackVertical={renderTrack}
          renderThumbVertical={renderThumb}
          renderView={renderView}
        >
          <div className="flex-grow overflow-y-auto">
            <Links collapsed={collapsed} routes={routes} />
          </div>
        </Scrollbars>
        <div className="mt-auto">
          <SidebarCard collapsed={collapsed} />
          <button
            onClick={toggleSidebar}
            className={`w-full h-16 border-t border-gray-600 dark:border-gray-800
              text-white dark:text-gray-400 hover:bg-gray-700 dark:hover:bg-gray-800
              flex items-center transition-colors
              ${collapsed ? 'justify-center p-4' : 'justify-between p-4'}`}
          >
            Toggle Sidebar
          </button>
        </div>
      </Card>
    </aside>
  );
}
