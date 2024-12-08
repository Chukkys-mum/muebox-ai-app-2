// /app/dashboard/main/page.tsx

import Main from '@/components/dashboard/main';
import {
  getProducts,
  getSubscription,
  getUser,
  getUserDetails
} from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

// app/dashboard/main/page.tsx
export default async function Account() {
  const supabase = createClient();
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  console.log('Main Page Auth Check:', {
    hasSession: !!session,
    error: sessionError,
    sessionData: session // Add this to see the full session data
  });

  if (!session) {
    console.log('No session found, redirecting to signin');
    return redirect('/dashboard/signin');
  }

  // Fetch data only if we have a session
  const [user, userDetails, products, subscription] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase),
    getProducts(supabase),
    getSubscription(supabase)
  ]);

  if (!user) {
    console.log('No user found despite session, redirecting to signin');
    return redirect('/dashboard/signin');
  }

  return (
    <Main
      userDetails={userDetails}
      user={user}
      products={products}
      subscription={subscription}
    />
  );
}
