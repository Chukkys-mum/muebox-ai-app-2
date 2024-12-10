// app/dashboard/ai-chat/page.tsx

import Chat from '@/components/dashboard/ai-chat';
import { createClient } from '@/utils/supabase/server';
import {
  getUser,
  getUserDetails,
  getProducts,
  getSubscription
} from '@/utils/supabase/queries';

export default async function AiChat() {
  const supabase = createClient();

  const [user, userDetails, products, subscription] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase),
    getProducts(supabase),
    getSubscription(supabase)
  ]);

  return (
    <Chat
      user={user}
      userDetails={userDetails}
      products={products}
      subscription={subscription}
    />
  );
}