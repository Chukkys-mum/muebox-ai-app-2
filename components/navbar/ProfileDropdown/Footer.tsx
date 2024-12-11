// /components/navbar/ProfileDropdown/Footer.tsx
// Purpose: Footer section of profile dropdown with auth actions and links

'use client';

import { FC } from 'react';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { handleRequest } from '@/utils/auth-helpers/client';
import { SignOut } from '@/utils/auth-helpers/server';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Footer: FC = () => {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;
  const pathname = usePathname();

  return (
    <div className="border-t border-border dark:border-zinc-800">
      <div className="p-3">
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          <span>Add another account</span>
        </button>
      </div>
      <div className="px-3 pb-3">
        <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
          <Input type="hidden" name="pathName" value={pathname} />
          <Button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-muted hover:bg-muted/80"
          >
            Sign out
          </Button>
        </form>
      </div>
      <div className="px-3 pb-3 text-center text-xs text-muted-foreground">
        <Link href="/privacy" className="hover:underline">Privacy policy</Link>
        <span className="mx-1">•</span>
        <Link href="/terms" className="hover:underline">Terms</Link>
        <span className="mx-1">•</span>
        <Link href="/cookies" className="hover:underline">Cookies</Link>
      </div>
    </div>
  );
};