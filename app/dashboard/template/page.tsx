// /app/dashboard/template/page.tsx

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import TemplateManagement from '@/components/dashboard/template';
import { getUser } from '@/utils/supabase/session';
import { getSubscription } from '@/utils/supabase/subscription';
import { getProductsWithPrices } from '@/utils/supabase/products';

export default async function TemplatePage() {
  const cookieStore = cookies();
  const supabase = createClient();

  // Get user, subscription, and product data
  const { user } = await getUser(cookieStore);
  const { subscription } = await getSubscription(cookieStore);
  const { products } = await getProductsWithPrices(cookieStore);
  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();

  return (
    <TemplateManagement
      user={user}
      products={products}
      subscription={subscription}
      userDetails={userDetails}
    />
  );
}