// types/team.ts

import { WithTimestamps, WithStatus } from './common';

// Team interface
export interface Team extends WithTimestamps, WithStatus {
  id: string;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Account Team interface
export interface AccountTeam extends WithTimestamps, WithStatus {
  id: string;
  account_id: string;
  team_id: string;
  metadata?: Record<string, any>;
}

// You can add more team-related types or interfaces here as needed

// For example, you might want to add types for team members and roles:

export type TeamRole = 'owner' | 'admin' | 'member' | 'guest';

export interface TeamMember extends WithTimestamps {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
}

// Team Invitation interface
export interface TeamInvitation extends WithTimestamps {
  id: string;
  team_id: string;
  inviter_id: string;
  invitee_email: string;
  role: TeamRole;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at: string;
}

// Team Settings interface
export interface TeamSettings {
  team_id: string;
  allow_member_invitations: boolean;
  default_member_role: TeamRole;
  require_admin_approval: boolean;
  max_members?: number;
  allowed_domains?: string[];
}

// Team Activity Log interface
export interface TeamActivityLog extends WithTimestamps {
  id: string;
  team_id: string;
  user_id: string;
  action: string;
  details: Record<string, any>;
}

// Team Resource interface
export interface TeamResource extends WithTimestamps {
  id: string;
  team_id: string;
  resource_type: 'document' | 'folder' | 'project' | 'task';
  resource_id: string;
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    share: boolean;
  };
}

// Team Query interface
export interface TeamQuery {
  account_id?: string;
  name?: string;
  status?: string;
  created_after?: string;
  created_before?: string;
  limit?: number;
  offset?: number;
}