// /components/sidebar/components/Links.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useContext } from 'react';
import { IconType } from 'react-icons';
import { IRoute } from '@/types';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { SubscriptionContext } from '@/context/layout';
import { Badge } from '@/components/ui/badge';

interface LinksProps {
  collapsed: boolean;
  routes: IRoute[];
}

export default function Links({ collapsed, routes }: LinksProps) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const subscription = useContext(SubscriptionContext);

  const handleToggle = (section: string) => {
    if (!collapsed) {
      setActiveSection(activeSection === section ? null : section);
    }
  };

  // Modified icon rendering function
  const renderIcon = (Icon: IconType | undefined) => {
    if (!Icon) return null;
    // Properly instantiate the icon component
    return <Icon className="text-white dark:text-gray-200" />;
  };

  const MenuItem = ({ item, isNested = false }: { item: IRoute; isNested?: boolean }) => {
    if (item.isPremium && !subscription) {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <button 
              className={`flex items-center w-full text-white dark:text-gray-200
                ${collapsed ? 'justify-center p-4' : 'p-2'} 
                ${isNested ? 'text-sm' : ''}
                hover:bg-gray-700 dark:hover:bg-gray-800 rounded-lg transition-colors
                group relative`}
            >
              <div className={`${collapsed ? 'w-5 h-5' : `w-6 h-6 ${isNested ? 'mr-2' : 'mr-3'}`}`}>
                {item.icon && renderIcon(item.icon)}
              </div>
              {!collapsed && (
                <>
                  <span>{item.name}</span>
                  <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-blue-500">
                    PRO
                  </Badge>
                </>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 hidden group-hover:block bg-gray-800 
                  text-white text-sm py-1 px-2 rounded whitespace-nowrap z-50">
                  {item.name} (PRO)
                </div>
              )}
            </button>
          </DialogTrigger>
          <DialogContent>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Upgrade to PRO</h2>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Link
        href={item.path || '#'}
        className={`flex items-center ${collapsed ? 'justify-center p-4' : 'p-2'}
          ${isNested ? 'text-sm' : ''} 
          hover:bg-gray-700 dark:hover:bg-gray-800 rounded-lg transition-colors
          ${pathname === item.path ? 'text-blue-500' : 'text-white dark:text-gray-200'}
          group relative`}
      >
        <div className={`${collapsed ? 'w-5 h-5' : `w-6 h-6 ${isNested ? 'mr-2' : 'mr-3'}`}`}>
          {item.icon && renderIcon(item.icon)}
        </div>
        {!collapsed && <span>{item.name}</span>}
        {collapsed && (
          <div className="absolute left-full ml-2 hidden group-hover:block bg-gray-800 
            text-white text-sm py-1 px-2 rounded whitespace-nowrap z-50">
            {item.name}
          </div>
        )}
      </Link>
    );
  };

  return (
    <div className={`flex flex-col ${collapsed ? 'p-0' : 'p-4'}`}>
      {routes.map((route, index) => {
        if (route.isSection) {
          return (
            <div
              key={`section-${index}`}
              className={`text-xs uppercase tracking-wider text-gray-300 
                dark:text-gray-400 my-4 px-2 ${collapsed ? 'text-center' : ''}`}
            >
              {!collapsed && route.name}
            </div>
          );
        }

        return (
          <div key={`route-${route.name}`} className="relative group">
            {route.items ? (
              // Render as a collapsible section
              <button
                onClick={() => handleToggle(route.name)}
                className={`flex items-center w-full text-left text-white 
                  dark:text-gray-200 relative
                  ${collapsed ? 'justify-center p-4' : 'p-2'}
                  hover:bg-gray-700 dark:hover:bg-gray-800 rounded-lg transition-colors`}
              >
                <div className={`${collapsed ? 'w-5 h-5' : 'w-6 h-6 mr-3'}`}>
                  {route.icon && renderIcon(route.icon)}
                </div>
                {!collapsed && <span>{route.name}</span>}
              </button>
            ) : (
              // Render as a regular menu item
              <MenuItem item={route} />
            )}

            {/* Render nested items if expanded */}
            {route.items && !collapsed && activeSection === route.name && (
              <div className="ml-6 mt-2 space-y-1">
                {route.items.map((item) => (
                  <MenuItem key={item.name} item={item} isNested />
                ))}
              </div>
            )}

            {/* Render popup menu for collapsed state */}
            {route.items && collapsed && (
              <div className="fixed left-20 bg-[#1a1d24] rounded-lg py-2 px-1 min-w-[200px] 
                shadow-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible 
                transition-all duration-150 z-50">
                {route.items.map((item) => (
                  <MenuItem key={item.name} item={item} isNested />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}