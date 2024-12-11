// /components/navbar/ProfileDropdown/MenuItems.tsx
// Purpose: Navigation menu items for the profile dropdown

'use client';

import { FC } from 'react';
import Link from 'next/link';
import { User, Clock, Lock, Settings, HelpCircle } from 'lucide-react';

const menuItems = [
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
  { icon: Clock, label: 'Dashboard', href: '/dashboard' },
  { icon: Lock, label: 'Posts & Activity', href: '/dashboard/activity' },
  { icon: Settings, label: 'Settings & Privacy', href: '/dashboard/settings' },
  { icon: HelpCircle, label: 'Help Center', href: '/help' }
];

export const MenuItems: FC = () => {
  return (
    <div className="py-2 px-1 max-h-[250px] overflow-y-auto">
      {menuItems.map(({ icon: Icon, label, href }) => (
        <Link
          key={label}
          href={href}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span>{label}</span>
        </Link>
      ))}
    </div>
  );
};