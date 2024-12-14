// /app/dashboard/page.tsx

import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function Dashboard() {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      redirect('/dashboard/signin');
    } else {
      redirect('/dashboard/main');
    }
  } catch (error) {
    console.error('Error in Dashboard:', error);
    redirect('/dashboard/signin');
  }
}


