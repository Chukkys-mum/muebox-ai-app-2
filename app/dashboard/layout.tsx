// app/dashboard/layout.tsx

import { ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';

export default async function DashboardRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Error fetching user:', error.message);
    }

    if (!user) {
      console.log('User not authenticated, redirecting to signin');
      redirect('/dashboard/signin');
    }

    return (
      <div className="mx-auto max-w-8xl flex flex-col">
        <div>{children}</div>
      </div>
    );
  } catch (err) {
    console.error('Unexpected error in DashboardRootLayout:', err);
    return (
      <div className="mx-auto max-w-8xl flex flex-col">
        <div>{children}</div>
      </div>
    );
  }
}
