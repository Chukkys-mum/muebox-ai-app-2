// /components/navbar/NavbarAdmin.tsx
// Purpose: Main navbar component using proper context hooks and types

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useOpen, useUser } from '@/context/layout';
import { handleRequest } from '@/utils/auth-helpers/client';
import { SignOut } from '@/utils/auth-helpers/server';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import NavLink from '@/components/link/NavLink';

import { IoSearch } from 'react-icons/io5';
import { 
  HiOutlineSun, 
  HiOutlineMoon,
  HiOutlineArrowRightOnRectangle 
} from 'react-icons/hi2';

// Components
import { IconButton } from './shared/IconButton';
import RecentlyUsedMenu from './RecentlyUsedMenu';
import ProfileDropdown from './ProfileDropdown';
import NotificationDropdownMenu from '@/components/common/NotificationDropdownMenu';
import { Input } from '@/components/ui/input';

interface Props {
  brandText: string;
  [x: string]: any;
}

const NavbarAdmin: React.FC<Props> = ({ brandText, ...props }) => {
  const { open, setOpen } = useOpen();
  const user = useUser();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { resolvedTheme, setTheme } = useTheme();
  const router = getRedirectMethod() === 'client' ? useRouter() : null;
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 1);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <nav className={cn(
      'fixed right-3 top-3 z-[0] flex w-[calc(100vw_-_6%)] flex-row items-center justify-between rounded-md',
      'bg-white/30 py-2 backdrop-blur-xl dark:bg-transparent',
      'md:right-[30px] md:top-4 md:w-[calc(100vw_-_8%)] md:p-2',
      'lg:w-[calc(100vw_-_6%)] xl:top-[20px] xl:w-[calc(100vw_-_365px)]',
      scrolled && 'shadow-md'
    )}>
      <div className="ml-[6px]">
        <div className="h-6 md:mb-2 md:w-[224px] md:pt-1">
          <Link
            className="hidden text-xs font-normal text-foreground hover:underline dark:text-white dark:hover:text-white md:inline"
            href=""
          >
            Pages
            <span className="mx-1 text-xs text-foreground hover:text-foreground dark:text-white">
              {' '}
              /{' '}
            </span>
          </Link>
          <NavLink
            className="text-xs font-normal capitalize text-foreground hover:underline dark:text-white dark:hover:text-white"
            href="#"
          >
            {brandText}
          </NavLink>
        </div>
        <p className="text-md shrink capitalize text-foreground dark:text-white md:text-3xl">
          <NavLink
            href="#"
            className="font-bold capitalize hover:text-foreground dark:hover:text-white"
          >
            {brandText}
          </NavLink>
        </p>
      </div>

      <div className="relative mx-auto w-1/3 hidden lg:flex">
        <Input
          type="search"
          placeholder="Search... (⌘ + K)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-white/10 dark:bg-zinc-900/50"
        />
        <IoSearch className="absolute right-4 top-2.5 text-muted-foreground" size={20} />
      </div>

      <div className="flex items-center gap-2 mr-4">
        <IconButton
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          ariaLabel="Toggle theme"
          icon={resolvedTheme === 'dark' ? <HiOutlineSun /> : <HiOutlineMoon />}
        />
        
        <RecentlyUsedMenu />
        
        <NotificationDropdownMenu
          notifications={[]}
          onMarkAllRead={() => {}}
        />

        <form className="contents" onSubmit={(e) => handleRequest(e, SignOut, router)}>
          <Input type="hidden" name="pathName" value={pathname} />
          <IconButton
            type="submit"
            ariaLabel="Sign out"
            icon={<HiOutlineArrowRightOnRectangle />}
          />
        </form>

        <ProfileDropdown
          userName={user?.user_metadata?.full_name || user?.email || 'User'}
          userImage={user?.user_metadata?.avatar_url}
          userEmail={user?.email || ''}
        />
      </div>
    </nav>
  );
};

export default NavbarAdmin;