'use client';

import {
  renderThumb,
  renderTrack,
  renderView
} from '@/components/scrollbar/Scrollbar';
import Links from '@/components/sidebar/components/Links';
import SidebarCard from '@/components/sidebar/components/SidebarCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
  OpenContext,
  UserContext,
  UserDetailsContext
} from '@/contexts/layout';
import { IRoute } from '@/types/types';
import { Database } from '@/types/types_db';
import { handleRequest } from '@/utils/auth-helpers/client';
import { SignOut } from '@/utils/auth-helpers/server';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import { getErrorRedirect } from '@/utils/helpers';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe } from '@/utils/stripe/server';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useContext, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { HiX } from 'react-icons/hi';
import { HiBolt, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import { Button } from '../ui/button';
export interface SidebarProps extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

type Price = Database['public']['Tables']['prices']['Row'];

function Sidebar(props: SidebarProps) {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;
  const { routes } = props;
  const { open, setOpen } = useContext(OpenContext);
  const user = useContext(UserContext);
  const userDetails = useContext(UserDetailsContext);
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const currentPath = usePathname();

  const handleCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push('/dashboard/signin/signup');
    }

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      price,
      currentPath
    );

    if (errorRedirect) {
      setPriceIdLoading(undefined);
      return router.push(errorRedirect);
    }

    if (!sessionId) {
      setPriceIdLoading(undefined);
      return router.push(
        getErrorRedirect(
          currentPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.'
        )
      );
    }

    const stripe = await getStripe();
    stripe?.redirectToCheckout({ sessionId });

    setPriceIdLoading(undefined);
  };

  // SIDEBAR
  return (
    <div
      className={`lg:!z-99 fixed !z-[99] min-h-full w-[300px] transition-all md:!z-[99] xl:!z-0 ${
        props.variant === 'auth' ? 'xl:hidden' : 'xl:block'
      } ${open ? '' : '-translate-x-[120%] xl:translate-x-[unset]'}`}
    >
      <Card
        className={`m-3 ml-3 h-[96.5vh] w-full overflow-hidden !rounded-md border-zinc-200 pe-4 dark:border-zinc-800 sm:my-4 sm:mr-4 md:m-5 md:mr-[-50px]`}
      >
        <Scrollbars
          autoHide
          renderTrackVertical={renderTrack}
          renderThumbVertical={renderThumb}
          renderView={renderView}
        >
          <div className="flex h-full flex-col justify-between">
            <div>
              <span
                className="absolute top-4 block cursor-pointer text-zinc-200 dark:text-white/40 xl:hidden"
                onClick={() => setOpen(false)}
              >
                <HiX />
              </span>
              <div className={`mt-8 flex items-center justify-center`}>
                <div className="me-2 flex h-[40px] w-[40px] items-center justify-center rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                  <HiBolt className="h-5 w-5" />
                </div>
                <h5 className="text-2xl font-bold leading-5 text-foreground dark:text-white">
                  Horizon AI
                </h5>
              </div>
              <div className="mb-8 mt-8 h-px bg-zinc-200 dark:bg-white/10" />
              {/* Nav item */}
              <ul className="-me-4">
                <Links routes={routes} />
              </ul>
            </div>
            {/* Free Horizon Card    */}
            <div className="mb-9 mt-7">
              <div className="flex justify-center">
                <SidebarCard handleCheckout={handleCheckout} />
              </div>
              {/* Sidebar profile info */}
              <div className="mt-5 flex w-full items-center rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
                <Link href="/dashboard/settings">
                  <Avatar className="min-h-10 min-w-10">
                    <AvatarImage src={user?.user_metadata.avatar_url} />
                    <AvatarFallback className="font-bold dark:text-foreground">
                      {userDetails.full_name
                        ? `${userDetails.full_name[0]}`
                        : `${user?.user_metadata.email[0].toUpperCase()}`}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <Link href="/dashboard/settings">
                  <p className="ml-2 mr-2 w-max max-w-100% flex items-center text-sm font-semibold leading-none text-foreground dark:text-white">
                    {user?.user_metadata.full_name
                      ? user?.user_metadata.full_name
                      : `User`}
                  </p>
                </Link>
                <form
                  className="w-full"
                  onSubmit={(e) => handleRequest(e, SignOut, router)}
                >
                  <input type="hidden" name="pathName" value={usePathname()} />
                  <Button
                    variant="outline"
                    className="ml-auto flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full p-0 text-center text-sm font-medium hover:dark:text-white"
                    type="submit"
                  >
                    <HiOutlineArrowRightOnRectangle
                      className="h-4 w-4 stroke-2 text-foreground dark:text-white"
                      width="16px"
                      height="16px"
                      color="inherit"
                    />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </Scrollbars>
      </Card>
    </div>
  );
}

// PROPS

export default Sidebar;
