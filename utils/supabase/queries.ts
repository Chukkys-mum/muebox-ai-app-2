// utils/supabase/queries.ts

// utils/supabase/queries.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';
import { Database } from '@/types/types_db';

// Type aliases from Database
type Tables = Database['public']['Tables']
type Product = Tables['products']['Row']
type Price = Tables['prices']['Row']
type Subscription = Tables['subscriptions']['Row']

// Extended types for joins
interface ProductWithPrices extends Product {
  prices: Price[];
}

interface PriceWithProduct extends Price {
  products: Product | null;
}

interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

export const getUser = async (supabase: SupabaseClient): Promise<User | null> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  
  return user;
};

export const getSubscription = async (
  supabase: SupabaseClient
): Promise<SubscriptionWithProduct | null> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  return data as SubscriptionWithProduct;
};

export const getProducts = async (
  supabase: SupabaseClient
): Promise<ProductWithPrices[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return (data as ProductWithPrices[]) ?? [];
};

// utils/supabase/queries.ts

export const getUserDetails = async (
  supabase: SupabaseClient
): Promise<Tables['users']['Row'] | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // If user doesn't exist in users table, create them
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email,
              avatar_url: user.user_metadata?.avatar_url,
              email: user.email
            }
          ])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user details:', insertError);
          return null;
        }

        return newUser;
      }
      
      console.error('Error fetching user details:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getUserDetails:', error);
    return null;
  }
};

export const getProductsWithPrices = async (
  supabase: SupabaseClient
): Promise<{ products: ProductWithPrices[] }> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, prices(*)');

  if (error) {
    console.error('Error fetching products with prices:', error);
    return { products: [] };
  }

  return { products: (data as ProductWithPrices[]) ?? [] };
};