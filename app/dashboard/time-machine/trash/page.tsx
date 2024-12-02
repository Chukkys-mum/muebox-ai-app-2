// /app/dashboard/time-machine/trash/page.tsx

import  Metadata  from 'next';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import TrashCan from "@/components/dashboard/time-machine/TrashCan";

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Trash | My Application',
  description: 'View and manage trashed files.'
};

export default async function TrashPage() {
  const cookieStore = cookies();
  const supabase = createClient();
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();

  // Loading state is handled automatically by Suspense
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Please sign in to view trash</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <TrashCan userId={session.user.id} />
    </div>
  );
}