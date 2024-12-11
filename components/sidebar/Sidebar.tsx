// /components/sidebar/Sidebar.tsx

'use client';

import { useEffect, useState, useContext } from 'react';
import {
  renderThumb,
  renderTrack,
  renderView
} from '@/components/scrollbar/Scrollbar';
import Links from '@/components/sidebar/components/Links';
import SidebarCard from '@/components/sidebar/components/SidebarCard';
import { Card } from '@/components/ui/card';
import {
  useUser,
  useOpen,
  UserDetailsContext,
  SubscriptionContext,
} from '@/context/layout';
import { IRoute } from '@/types/ui';
import { FaChevronLeft } from 'react-icons/fa';
import { HiBolt } from 'react-icons/hi2';
import { Scrollbars } from 'react-custom-scrollbars-2';
import useMediaQuery from '@/hooks/useMediaQuery';
import { useSupabase } from '@/app/supabase-provider';

const NAVBAR_HEIGHT = '64px';

interface SidebarProps {
  routes: IRoute[];
}

export default function Sidebar({ routes }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { open, setOpen } = useOpen(); // Use the hook instead of useContext
  const user = useUser(); // Use the hook instead of useContext
  const userDetails = useContext(UserDetailsContext);
  const subscription = useContext(SubscriptionContext);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { supabase } = useSupabase();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        // You might want to update the UserContext here if it's not already being done elsewhere
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [supabase.auth]);

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
      setOpen(false);
    }
  }, [isMobile, setOpen]);

  const toggleSidebar = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    setOpen(!newCollapsedState);
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or a more sophisticated loading indicator
  }

  return (
    <aside
      className={`fixed left-0 transition-all duration-300 z-[99] min-h-full
        ${collapsed ? 'w-20' : 'w-64'}
        ${open ? '' : '-translate-x-full'}
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
              <h5 className="ml-3 text-xl font-bold text-white dark:text-white">
                Horizon AI
              </h5>
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
            {collapsed ? (
              <FaChevronLeft className="transform rotate-180" />
            ) : (
              <>
                <span>Collapsed view</span>
                <FaChevronLeft />
              </>
            )}
          </button>
        </div>
      </Card>
    </aside>
  );
}