// types/auth.ts

import { WithTimestamps, WithStatus, Status } from './common';
import { User } from './user';

// User trigger type
export type NewUserTrigger = {
  id: string;
  raw_user_meta_data: {
    full_name?: string;
    avatar_url?: string;
  };
}

// RLS Policy type
export type RLSPolicy = {
  schema: string;
  table: string;
  name: string;
  action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  check?: string;
  using?: string;
}

// Role name constants
export const ROLE_NAMES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEAM_ADMIN: 'team_admin',
  MEMBER: 'member'
} as const;

// Permission scheme name constants
export const PERMISSION_SCHEME_NAMES = {
  SUPER_ADMIN: 'super_admin_scheme',
  ADMIN: 'admin_scheme',
  TEAM_ADMIN: 'team_admin_scheme',
  MEMBER: 'member_scheme'
} as const;

// Role interface
export interface Role extends WithTimestamps, WithStatus {
  id: string;
  name: string;
  permission_scheme_id: string;
}

// Permission scheme interface
export interface PermissionScheme extends WithTimestamps, WithStatus {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, any>;
  is_super_admin: boolean;
  is_account_admin: boolean;
}

// User details interface
export interface UserDetails {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  avatar_url?: string;
}

// Account user interface
export interface AccountUser extends WithTimestamps, WithStatus {
  id: string;
  account_id: string;
  user_id: string;
  role_id: string;
  is_primary: boolean;
  metadata?: Record<string, any>;
}

interface PermissionQueryResponse {
  role_id: string;
  roles: {
    permission_scheme_id: string;
    permission_schemes: {
      permissions: string[];
    } | null;
  } | null;
}

// You can add more auth-related types or interfaces here as needed