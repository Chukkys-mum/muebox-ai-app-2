// app/dashboard/user-profile/page.tsx

import UserProfile from '@/components/dashboard/user-profile';
import {
  getProducts,
  getSubscription,
  getUser,
  getUserDetails
} from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function UserProfilePage() {
  const supabase = createClient();
  const [user, userDetails, products, subscription] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase),
    getProducts(supabase),
    getSubscription(supabase)
  ]);
  if (!user) {
    return redirect('/dashboard/signin');
  }

  return (
    <UserProfile
      userDetails={userDetails}
      user={user}
      products={products}
      subscription={subscription}
    />
  );
}
