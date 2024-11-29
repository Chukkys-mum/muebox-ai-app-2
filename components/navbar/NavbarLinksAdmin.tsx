'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { OpenContext, UserContext } from '@/contexts/layout';
import { handleRequest } from '@/utils/auth-helpers/client';
import { SignOut } from '@/utils/auth-helpers/server';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { FiAlignJustify } from 'react-icons/fi';
import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineInformationCircle,
  HiOutlineMoon,
  HiOutlineSun
} from 'react-icons/hi2';
import { Input } from '../ui/input';

export default function HeaderLinks() {
  const { open, setOpen } = useContext(OpenContext);
  const user = useContext(UserContext);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = getRedirectMethod() === 'client' ? useRouter() : null;

  const onOpen = () => {
    setOpen(!open);
  };
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative flex min-w-max max-w-max flex-grow items-center justify-around gap-1 rounded-md md:px-2 md:py-2 md:pl-3 xl:gap-2">
      <Button
        variant="outline"
        className="flex h-9 min-w-9 cursor-pointer rounded-full border-zinc-200 p-0 text-xl text-foreground dark:border-zinc-800 dark:text-white md:min-h-10 md:min-w-10 xl:hidden"
        onClick={onOpen}
      >
        <FiAlignJustify className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        className="flex h-9 min-w-9 cursor-pointer rounded-full border-zinc-200 p-0 text-xl text-foreground dark:border-zinc-800 dark:text-white md:min-h-10 md:min-w-10"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'light' ? (
          <HiOutlineMoon className="h-4 w-4 stroke-2" />
        ) : (
          <HiOutlineSun className="h-5 w-5 stroke-2" />
        )}
      </Button>

      {/* Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex h-9 min-w-9 cursor-pointer rounded-full border-zinc-200 p-0 text-xl text-foreground dark:border-zinc-800 dark:text-white md:min-h-10 md:min-w-10"
          >
            <HiOutlineInformationCircle className="h-[20px] w-[20px] text-foreground dark:text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-2 bg-white dark:bg-zinc-950 dark:border-zinc-800">
          <Link target="blank" href="/pricing" className="w-full">
            <Button
              variant="outline"
              className="dark:hover:text-white mb-2 w-full"
            >
              Pricing
            </Button>
          </Link>
          <a target="blank" href="mailto:hello@horizon-ui.com">
            <Button
              variant="outline"
              className="dark:hover:text-white mb-2 w-full"
            >
              Help & Support
            </Button>
          </a>
          <Link target="blank" href="/#faqs">
            <Button variant="outline" className="dark:hover:text-white w-full">
              FAQs & More
            </Button>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>

      <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
        <Input type="hidden" name="pathName" value={usePathname()} />
        <Button
          type="submit"
          variant="outline"
          className="flex h-9 min-w-9 cursor-pointer rounded-full border-zinc-200 p-0 text-xl text-foreground dark:border-zinc-800 dark:text-white md:min-h-10 md:min-w-10"
        >
          <HiOutlineArrowRightOnRectangle className="h-4 w-4 stroke-2 text-foreground dark:text-white" />
        </Button>
      </form>

      <Link className="w-full" href="/dashboard/settings">
        <Avatar className="h-9 min-w-9 md:min-h-10 md:min-w-10">
          <AvatarImage src={user?.user_metadata.avatar_url} />
          <AvatarFallback className="font-bold">
            {user?.user_metadata.full_name
              ? `${user?.user_metadata.full_name[0]}`
              : `${user?.email[0].toUpperCase()}`}
          </AvatarFallback>
        </Avatar>
      </Link>
    </div>
  );
}
