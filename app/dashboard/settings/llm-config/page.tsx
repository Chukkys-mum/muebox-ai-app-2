// /app/dashboard/llm-config/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { LLMConfig } from '@/components/dashboard/settings/LLM/LLMConfig';
import { Database } from '@/types/types_db';

export default async function LLMConfigPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    return <div>Please log in to access this page.</div>;
  }

  const { data: providers } = await supabase.from('llm_providers').select('*');
  const { data: userKeys } = await supabase
    .from('user_api_keys')
    .select('llm_id, api_key')
    .eq('user_id', session.user.id);

  return (
    <LLMConfig
      userId={session.user.id}
      initialProviders={providers || []}
      initialUserKeys={userKeys || []}
    />
  );
}