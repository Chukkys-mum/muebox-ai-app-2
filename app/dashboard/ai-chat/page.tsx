// app/dashboard/ai-chat/page.tsx

import Chat from '@/components/dashboard/ai-chat';
import {
  getProducts,
  getSubscription,
  getUser,
  getUserDetails
} from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { Database } from '@/types/types_db';

// Use the same types as the Chat component
type Product = Database['public']['Tables']['products']['Row'];
type Price = Database['public']['Tables']['prices']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface ProductWithPrices extends Product {
  prices: Price[];
}

interface PriceWithProduct extends Price {
  products: Product | null;
}

interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

export default async function AiChat() {
  const supabase = createClient();

  try {
    const [user, userDetails, productsData, subscriptionData] = await Promise.all([
      getUser(supabase),
      getUserDetails(supabase),
      getProducts(supabase),
      getSubscription(supabase)
    ]);

    if (!user) {
      return redirect('/dashboard/signin');
    }

    // Cast the data to match the Chat component's expected types
    const products = productsData as unknown as ProductWithPrices[];
    const subscription = subscriptionData as unknown as SubscriptionWithProduct | null;

    return (
      <Chat
        user={user}
        userDetails={userDetails}
        products={products}
        subscription={subscription}
      />
    );
  } catch (error) {
    console.error('Error loading chat data:', error);
    return redirect('/dashboard/error');
  }
}