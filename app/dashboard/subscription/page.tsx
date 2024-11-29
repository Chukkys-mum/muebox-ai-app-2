import Subscription from '@/components/dashboard/subscription';
import {
  getProducts,
  getSubscription,
  getUser,
  getUserDetails
} from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function Sub() {
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
    <Subscription
      userDetails={userDetails}
      user={user}
      products={products}
      subscription={subscription}
    />
  );
}
