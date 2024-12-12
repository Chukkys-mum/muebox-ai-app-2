// /app/dashboard/main/page.tsx

import Main from '@/components/dashboard/main';
import { getUser, getUserDetails, getProducts, getSubscription } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function Account() {
  try {
    const supabase = await createClient(); // Await the promise here
    console.log('Supabase client initialized:', supabase);

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) console.error('Error in getSession:', sessionError);

    console.log('Session data:', session);
    if (!session) {
      console.log('No session found, redirecting');
      return redirect('/dashboard/signin');
    }

    const [user, userDetails, products, subscription] = await Promise.all([
      getUser(supabase),
      getUserDetails(supabase),
      getProducts(supabase),
      getSubscription(supabase),
    ]);

    if (!user) {
      console.log('No user found, redirecting to signin');
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
  } catch (error) {
    console.error('Error loading Account page:', error);
    return redirect('/dashboard/signin');
  }
}
