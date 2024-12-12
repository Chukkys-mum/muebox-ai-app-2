// app/layout.tsx

import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import SupabaseProvider from './supabase-provider';
import { ThemeProvider } from './theme-provider';
import { Toaster } from "@/components/ui/toaster";
import Loading from './loading';
import '@/styles/globals.css';

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
function RootLayoutInner({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Suspense fallback={<Loading />}>
        {children}
      </Suspense>
      <Toaster />
    </ThemeProvider>
  );
}

// Main root layout
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Muebox AI - Personalising AI for People and Organisations</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="Add here your main keywords and separate them with a comma" />
        <meta name="description" content="Add here your website description" />
        <meta itemProp="name" content="Add here your website name / title" />
        <meta itemProp="description" content="Add here your website description" />
        <meta itemProp="image" content="Add here the link for your website SEO image" />
        <meta name="twitter:card" content="product" />
        <meta name="twitter:title" content="Add here your website name / title" />
        <meta name="twitter:description" content="Add here your website description" />
        <meta name="twitter:image" content="Add here the link for your website SEO image" />
        <meta property="og:title" content="Add here your website name / title" />
        <meta property="og:type" content="product" />
        <meta property="og:url" content="https://your-website.com" />
        <meta property="og:image" content="Add here the link for your website SEO image" />
        <meta property="og:description" content="Add here your website description" />
        <meta property="og:site_name" content="Add here your website name / title" />
        <link rel="canonical" href="https://your-website.com" />
        <link rel="icon" href="/img/favicon.ico" />
      </head>
      <body className="loading bg-white">
        <AuthProvider>
          <RootLayoutInner>
            <main id="skip">{children}</main>
          </RootLayoutInner>
        </AuthProvider>
      </body>
    </html>
  );
}
