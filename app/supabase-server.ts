// app/supabase-server.ts
import { Database } from '@/types/types_db';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { ProductWithPrice } from '@/types/subscription';

type ProductRow = Database['public']['Tables']['products']['Row'];
type PriceRow = Database['public']['Tables']['prices']['Row'];

// Define a type for the joined query response
type ProductWithPricesRow = ProductRow & {
  prices: PriceRow[] | null;
};

export const createServerSupabaseClient = cache(() => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ 
    cookies: () => cookieStore 
  });
});

export async function getActiveProductsWithPrices(): Promise<ProductWithPrice[]> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        active,
        name,
        description,
        image,
        metadata,
        prices (
          id,
          product_id,
          active,
          description,
          unit_amount,
          currency,
          type,
          interval,
          interval_count,
          trial_period_days,
          metadata,
          account_id
        )
      `)
      .eq('active', true);

    if (error || !data) return [];

    return data.map((product: ProductWithPricesRow) => ({
      id: product.id,
      active: product.active,
      name: product.name,
      description: product.description,
      image: product.image,
      metadata: product.metadata,
      prices: product.prices?.map(price => ({
        ...price,
        products: {
          id: product.id,
          active: product.active,
          name: product.name,
          description: product.description,
          image: product.image,
          metadata: product.metadata
        }
      }))
    }));
  } catch (error) {
    console.error('Critical error in getActiveProductsWithPrices:', error);
    return [];
  }
}

export async function getUserDetails() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Critical error in getUserDetails:', error);
    return null;
  }
}

export async function getSessionUser() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Critical error in getSessionUser:', error);
    return null;
  }
}