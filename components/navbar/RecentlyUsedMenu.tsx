// /components/navbar/RecentlyUsedMenu.tsx
// Purpose: Manages and displays recently accessed menu items with persistence

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IconButton } from './shared/IconButton';
import { MdApps } from 'react-icons/md';
import { routes } from '@/components/routes'; // Updated import path
import { usePathname } from 'next/navigation';
import { IRoute } from '@/types';

interface RecentMenuItem {
  name: string;
  path: string;
  icon: IRoute['icon'];
  lastUsed: number;
}

const MAX_RECENT_ITEMS = 9;
const STORAGE_KEY = 'recentlyUsedMenuItems';

// Helper function to flatten nested routes
const flattenRoutes = (routes: IRoute[]): IRoute[] => {
  return routes.reduce((acc: IRoute[], route) => {
    if (route.items) {
      return [...acc, route, ...flattenRoutes(route.items)];
    }
    return [...acc, route];
  }, []);
};

const RecentlyUsedMenu = () => {
  const [recentItems, setRecentItems] = useState<RecentMenuItem[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    // Load recent items from localStorage
    const loadRecentItems = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setRecentItems(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load recent items:', error);
      }
    };

    loadRecentItems();
  }, []);

  // Update localStorage when items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentItems));
    } catch (error) {
      console.error('Failed to save recent items:', error);
    }
  }, [recentItems]);

  const addToRecent = (route: IRoute) => {
    if (!route.icon || route.collapse) return; // Skip items without icons or with subitems

    const newItem: RecentMenuItem = {
      name: route.name,
      path: route.path,
      icon: route.icon,
      lastUsed: Date.now()
    };

    setRecentItems(prev => {
      const filtered = prev.filter(i => i.path !== newItem.path);
      return [newItem, ...filtered].slice(0, MAX_RECENT_ITEMS);
    });
  };

  // Effect to track current route
  useEffect(() => {
    const allRoutes = flattenRoutes(routes);
    const currentRoute = allRoutes.find(route => route.path === pathname);
    if (currentRoute && !currentRoute.collapse) {
      addToRecent(currentRoute);
    }
  }, [pathname]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <IconButton 
            ariaLabel="Recently used features" 
            icon={<MdApps className="h-5 w-5" />} 
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[300px] p-4 bg-background border border-border"
        align="end"
      >
        <DropdownMenuGroup className="grid grid-cols-3 gap-4">
          {recentItems.length > 0 ? (
            recentItems.map((item) => {
              const Icon = item.icon;
              if (!Icon) return null;
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <Icon className="h-6 w-6 mb-2" />
                  <span className="text-xs text-center font-medium">{item.name}</span>
                </Link>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-4 text-sm text-muted-foreground">
              No recent items
            </div>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RecentlyUsedMenu;