// app/layout.tsx

import { Suspense } from 'react';
import SupabaseProvider from './supabase-provider';
import { ThemeProvider } from './theme-provider';
import { Toaster } from "@/components/ui/toaster";
import Loading from './loading';
import '@/styles/globals.css';

export const dynamic = 'force-dynamic';

function RootLayoutInner({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <SupabaseProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
        <Toaster />
      </ThemeProvider>
    </SupabaseProvider>
  );
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>
          Muebox AI - Personalising Ai for people and organisations
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* <!--  Social tags   --> */}
        <meta
          name="keywords"
          content="Add here your main keywords and separate them with a comma"
        />
        <meta name="description" content="Add here your website description" />
        {/* <!-- Schema.org markup for Google+ --> */}
        <meta itemProp="name" content="Add here your website name / title" />
        <meta
          itemProp="description"
          content="Add here your website description"
        />
        <meta
          itemProp="image"
          content="Add here the link for your website SEO image"
        />
        {/* <!-- Twitter Card data --> */}
        <meta name="twitter:card" content="product" />
        <meta
          name="twitter:title"
          content="Add here your website name / title"
        />
        <meta
          name="twitter:description"
          content="Add here your website description"
        />
        <meta
          name="twitter:image"
          content="Add here the link for your website SEO image"
        />
        {/* <!-- Open Graph data --> */}
        <meta
          property="og:title"
          content="Add here your website name / title"
        />
        <meta property="og:type" content="product" />
        <meta property="og:url" content="https://your-website.com" />
        <meta
          property="og:image"
          content="Add here the link for your website SEO image"
        />
        <meta
          property="og:description"
          content="Add here your website description"
        />
        <meta
          property="og:site_name"
          content="Add here your website name / title"
        />
        <link rel="canonical" href="https://your-website.com" />
        <link rel="icon" href="/img/favicon.ico" />
      </head>
      <body className="loading bg-white">
        <RootLayoutInner>
          <main id="skip">{children}</main>
        </RootLayoutInner>
      </body>
    </html>
  );
}