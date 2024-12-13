// app/layout.tsx

import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import SupabaseProvider from './supabase-provider';
import { ThemeProvider } from './theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Loading from './loading';
import '@/styles/globals.css';
import Sidebar from '@/components/sidebar/Sidebar';
import NavbarAdmin from '@/components/navbar/NavbarAdmin';
import { routes } from '@/components/routes'; // Import your route definitions
import { getActiveRoute } from '@/utils/navigation';

export const dynamic = 'force-dynamic';

// Improved AuthProvider with error handling
async function AuthProvider({ children }: { children: React.ReactNode }) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error fetching session:', error);
      return <>{children}</>; // Render children even if session fetch fails
    }

    return (
      <SupabaseProvider session={session}>
        {children}
      </SupabaseProvider>
    );
  } catch (err) {
    console.error('Error initializing AuthProvider:', err);
    return <>{children}</>; // Fallback to rendering children in case of critical error
  }
}

// Inner layout for shared theming and suspense fallback
function RootLayoutInner({
  children,
  isPublic,
}: {
  children: React.ReactNode;
  isPublic: boolean;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Suspense fallback={<Loading />}>
        {!isPublic ? (
          <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950">
            <div className="fixed left-0 top-0 h-full w-[280px] border-r border-gray-200 dark:border-zinc-800">
              <Sidebar routes={routes} />
            </div>
            <div className="flex flex-1 flex-col pl-[280px]">
              <div className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl dark:bg-zinc-950/80">
                <NavbarAdmin brandText="Dashboard" />
              </div>
              <main className="flex-1 overflow-auto px-2.5 pt-[90px]">{children}</main>
            </div>
          </div>
        ) : (
          <main className="min-h-screen bg-gray-100 dark:bg-zinc-950">{children}</main>
        )}
      </Suspense>
      <Toaster />
    </ThemeProvider>
  );
}

// Main root layout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const publicRoutes = [
    '/EmailSignIn',
    '/Signup',
    '/ForgotPassword',
    '/UpdatePassword',
    '/PasswordSignin',
    '/OauthSignIn',
  ];
  const pathname = '/'; // Placeholder for server-side path checking
  const isPublic = publicRoutes.includes(pathname);

  return (
    <html lang="en">
      <head>
        <title>Muebox AI - Personalising AI for People and Organisations</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/img/favicon.ico" />
      </head>
      <body className="loading bg-white">
        <AuthProvider>
          <RootLayoutInner isPublic={isPublic}>{children}</RootLayoutInner>
        </AuthProvider>
      </body>
    </html>
  );
}

