// /app/dashboard/ai-assistant/page.tsx

import Assistant from '@/components/dashboard/ai-assistant';
import {
  getProducts,
  getSubscription,
  getUser,
  getUserDetails,
} from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function AiAssistant() {
  // Ensure await is used for the client creation
  const supabase = await createClient();
  
  // Use Promise.all to fetch data in parallel
  const [user, userDetails, products, subscription] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase),
    getProducts(supabase),
    getSubscription(supabase),
  ]);

  // Redirect to sign-in if the user is not found
  if (!user) {
    redirect('/dashboard/signin');
    return null; // Avoid further rendering
  }

  // Pass fetched data to the Assistant component
  return (
    <Assistant
      userDetails={userDetails}
      user={user}
      products={products}
      subscription={subscription}
    />
  );
}
