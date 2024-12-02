// @/app/actions/emailActions.ts

'use server';

import { createClient } from '@/utils/supabase/server';
import { EmailAccount } from '@/types/email';
import { Database } from '@/types/types_db';

export async function getEmailAccounts(): Promise<EmailAccount[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('email_accounts')
    .select('*');

  if (error) throw error;
  return data as EmailAccount[];
}

export async function removeEmailAccount(accountId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('email_accounts')
    .delete()
    .eq('id', accountId);

  if (error) throw error;
}

export async function triggerAccountSync(accountId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('email_sync_status')
    .upsert({
      account_id: accountId,
      status: 'syncing',
      last_sync: new Date().toISOString()
    })
    .eq('account_id', accountId);

  if (error) throw error;
}