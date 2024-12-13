// /app/dashboard/page.tsx

import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function Dashboard() {
  const supabase = await createClient(); // Use 'await' here

  try {
    const user = await getUser(supabase); // Fetch user data

    if (!user) {
      redirect('/dashboard/signin'); // Redirect unauthenticated users
    } else {
      redirect('/dashboard/main'); // Redirect authenticated users
    }
  } catch (error) {
    console.error('Error in Dashboard:', error);
    redirect('/dashboard/signin'); // Fallback redirect on error
  }
}


