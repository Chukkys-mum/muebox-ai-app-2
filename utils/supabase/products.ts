// /utils/supabase/products.ts
import { cookies } from 'next/headers';
import { createClient } from './server';

export async function getProductsWithPrices(cookieStore: ReturnType<typeof cookies>) {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*, prices(*)');
  return { products: products ?? [] };
}