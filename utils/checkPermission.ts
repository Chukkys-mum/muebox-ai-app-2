// utils/checkPermission.ts

import { createClient } from '@/utils/supabase/server';

export async function checkPermission(userId: string, permission: string): Promise<boolean> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('account_users')
    .select('roles(permission_schemes(permissions))')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error checking permission:', error);
    return false;
  }

  const permissions = data?.roles?.permission_schemes?.permissions;
  return permissions && permissions.includes(permission);
}