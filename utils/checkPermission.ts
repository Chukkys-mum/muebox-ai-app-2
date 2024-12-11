// utils/checkPermission.ts

import { createClient } from '@/utils/supabase/server';
import { Json } from '@/types/types_db';

// Type guard to check if value is string array
function isStringArray(value: Json): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

export async function checkPermission(userId: string, permission: string): Promise<boolean> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('account_users')
    .select(`
      roles (
        permission_schemes (
          permissions
        )
      )
    `)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error checking permission:', error);
    return false;
  }

  // Safely access nested permissions
  const permissions = data?.roles?.permission_schemes?.permissions;

  // If no permissions found
  if (!permissions) {
    return false;
  }

  // Handle permissions based on type
  if (isStringArray(permissions)) {
    // If permissions is a string array, directly check inclusion
    return permissions.includes(permission);
  } else if (typeof permissions === 'object' && permissions !== null) {
    // If permissions is an object, check if the permission exists as a key or value
    return Object.values(permissions).some(value => 
      value === permission || (Array.isArray(value) && value.includes(permission))
    );
  }

  return false;
}