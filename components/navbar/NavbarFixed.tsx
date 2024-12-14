// /components/navbar/NavbarFixed.tsx

/* eslint-disable */
'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  HiBolt,
  HiOutlineGlobeEuropeAfrica,
  HiOutlineMoon,
  HiOutlineShieldCheck,
  HiOutlineSun,
  HiStar,
} from 'react-icons/hi2';
import { IoMenuOutline } from 'react-icons/io5';
import { routes } from '@/components/routes';

interface NavbarFixedProps {
  secondary?: boolean;
  message?: string;
}

export default function NavbarFixed(props: NavbarFixedProps) {
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const privateRoutes = routes.filter((route) => !route.isPublic);

  useEffect(() => {
    const changeNavbar = () => {
      setScrolled(window.scrollY > 1);
    };

    window.addEventListener('scroll', changeNavbar);
    return () => {
      window.removeEventListener('scroll', changeNavbar);
    };
  }, []);

  return (
    <div
      className={`fixed left-[50%] top-0 z-[49] mx-auto flex w-full translate-x-[-50%] flex-col items-center border-gray-300 bg-white leading-[25.6px] dark:border-white dark:bg-zinc-950 xl:justify-center`}
    >
      {/* Header Section */}
      <div className="hidden w-full justify-center bg-zinc-100 dark:bg-zinc-900 lg:flex">
        <div className="flex w-[calc(100vw_-_4%)] justify-center gap-[40px] py-3 lg:w-[100vw] xl:w-[calc(100vw_-_250px)] 2xl:w-[1200px]">
          <div className="flex items-center">
            <HiOutlineShieldCheck className="mr-1.5 h-3 w-3 text-foreground dark:text-white" />
            <p className="text-xs font-medium text-foreground dark:text-white">
              Founded in EU. We respect your privacy.
            </p>
          </div>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <HiStar key={i} className="mr-[1px] h-3 w-3 text-foreground dark:text-white" />
            ))}
            <p className="text-xs font-medium text-foreground dark:text-white">
              Loved by 80,000+ users worldwide
            </p>
          </div>
          <div className="flex items-center">
            <HiOutlineGlobeEuropeAfrica className="mr-1.5 h-3 w-3 text-foreground dark:text-white" />
            <p className="text-xs font-medium text-foreground dark:text-white">
              #1 ShadCN UI Template & Boilerplate
            </p>
          </div>
        </div>
      </div>

      {/* Navbar Content */}
      <div className="flex w-[calc(100vw_-_4%)] items-center justify-between gap-[40px] py-5 lg:w-[100vw] xl:w-[calc(100vw_-_250px)]">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="flex items-center">
            <div className="me-2 flex h-[40px] w-[40px] items-center justify-center rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <HiBolt className="h-5 w-5" />
            </div>
            <h5 className="text-2xl font-bold text-foreground dark:text-white">Muebox Ai</h5>
          </div>
        </Link>

        {/* Links */}
        <div className="hidden lg:flex items-center">
          {['Dashboard', 'Features', 'Pricing', 'FAQs'].map((text, idx) => (
            <Link
              key={idx}
              href={text === 'Dashboard' ? '/dashboard/ai-chat' : `/#${text.toLowerCase()}`}
              className="mr-[30px] text-sm font-medium text-foreground dark:text-white"
            >
              {text}
            </Link>
          ))}
          <Button
            variant="outline"
            className="me-3 flex rounded-full border-zinc-200 dark:border-zinc-800"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'light' ? (
              <HiOutlineMoon className="h-4 w-4 stroke-2" />
            ) : (
              <HiOutlineSun className="h-5 w-5 stroke-2" />
            )}
          </Button>
          <Link href="/dashboard/signin" className="text-sm font-semibold text-foreground dark:text-white">
            Login
          </Link>
          <Link href="/dashboard/signin">
            <Button variant="outline" className="dark:text-white">
              Get started for Free
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IoMenuOutline className="block h-5 w-5 cursor-pointer text-foreground dark:text-white lg:hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-[80] w-56">
            {['Dashboard', 'Features', 'Pricing', 'FAQs'].map((text, idx) => (
              <DropdownMenuItem key={idx}>
                <Link
                  href={text === 'Dashboard' ? '/dashboard/ai-chat' : `/#${text.toLowerCase()}`}
                  className="text-md font-medium text-foreground dark:text-white"
                >
                  {text}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Footer Message */}
      {props.secondary && <p className="text-white">{props.message}</p>}
    </div>
  );
}