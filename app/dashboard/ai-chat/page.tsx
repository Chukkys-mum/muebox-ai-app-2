// app/dashboard/ai-chat/page.tsx

import Chat from '@/components/dashboard/ai-chat';
import { createClient } from '@/utils/supabase/server';
import {
  getUser,
  getUserDetails,
  getProducts,
  getSubscription,
} from '@/utils/supabase/queries';
import {
  adaptProductWithPrices,
  adaptSubscriptionWithProduct,
} from '@/types/adapters';
import {
  UserProvider,
  UserDetailsProvider,
  ProductsProvider,
  SubscriptionProvider,
} from '@/context/layout';

export default async function AiChatPage() {
  // Ensure await is used for the client creation
  const supabase = await createClient();

  // Fetch data from Supabase using Promise.all
  const [user, userDetails, dbProducts, dbSubscription] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase),
    getProducts(supabase),
    getSubscription(supabase),
  ]);

  // Adapt data to match the expected types
  const products = dbProducts.map(adaptProductWithPrices);
  const subscription = dbSubscription
    ? adaptSubscriptionWithProduct(dbSubscription)
    : null;

  // Provide context to child components and render the Chat component
  return (
    <UserProvider value={user}>
      <UserDetailsProvider value={userDetails}>
        <ProductsProvider value={products}>
          <SubscriptionProvider value={subscription}>
            <Chat />
          </SubscriptionProvider>
        </ProductsProvider>
      </UserDetailsProvider>
    </UserProvider>
  );
}
