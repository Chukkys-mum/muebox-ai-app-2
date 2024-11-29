// /components/auth/index.tsx

'use client';

import Footer from '@/components/footer/FooterAuthDefault';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { PropsWithChildren } from 'react';
import { FaChevronLeft } from 'react-icons/fa6';
import { HiBolt } from 'react-icons/hi2';
import { IoMoon, IoSunny } from 'react-icons/io5';
import { Button } from '../ui/button';

interface DefaultAuthLayoutProps extends PropsWithChildren {
  children: JSX.Element;
  viewProp: any;
}

export default function DefaultAuthLayout(props: DefaultAuthLayoutProps) {
  const { children } = props;
  const { theme, setTheme } = useTheme();
  return (
    <div className="relative h-max dark:bg-zinc-950">
      <div className="mx-auto flex w-full flex-col justify-center px-5 pt-0 md:h-[unset] md:max-w-[66%] lg:h-[100vh] lg:max-w-[66%] lg:px-6 xl:pl-0 ">
        <Link className="mt-10 w-fit text-zinc-950 dark:text-white" href="/">
          <div className="flex w-fit items-center lg:pl-0 lg:pt-0 xl:pt-0">
            <FaChevronLeft className="mr-3 h-[13px] w-[8px] text-zinc-950 dark:text-white" />
            <p className="ml-0 text-sm text-zinc-950 dark:text-white">
              Back to the website
            </p>
          </div>
        </Link>
        {children}
        <div className="absolute right-0 hidden h-full min-h-[100vh] xl:block xl:w-[50vw] 2xl:w-[44vw]">
          <div className="absolute flex h-full w-full flex-col items-center justify-center bg-zinc-950 dark:bg-zinc-900">
            <div className="mb-6 flex flex-col items-center">
              {/* Logo */}
              <div className="flex h-[150px] w-[150px] items-center justify-center">
                <img
                  src="/img/Muebox lo 2 WHT.png"
                  alt="Muebox Logo"
                  className="h-[170px] w-[170px] object-contain"
                />
              </div>
              {/* Tagline */}
              <h5 className="mt-4 text-center text-3xl font-bold leading-snug text-white">
                Personalized AI for You and Your Enterprise
              </h5>
            </div>
            {/* Quote Section */}
            <div className="flex w-full flex-col items-center justify-center px-4 text-center text-2xl font-bold text-white">
              <h4 className="mb-5 max-w-xl rounded-md text-2xl font-bold">
                “Muebox AI empowers enterprises and individuals by creating personalized 
                AI experiences tailored to your needs. Unlock adaptive intelligence for every interaction.”
              </h4>
              <h5 className="text-xl font-medium leading-5 text-zinc-300">
                Dean Bryan - Founder & CEO
              </h5>
            </div>
          </div>
        </div>
        <Footer />
      </div>
      <Button
        className="absolute bottom-10 right-10 flex min-h-10 min-w-10 cursor-pointer rounded-full bg-zinc-950 p-0 text-xl text-white hover:bg-zinc-950 dark:bg-white dark:text-zinc-950 hover:dark:bg-white xl:bg-white xl:text-zinc-950 xl:hover:bg-white xl:dark:text-zinc-900"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'light' ? (
          <IoMoon className="h-4 w-4" />
        ) : (
          <IoSunny className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
