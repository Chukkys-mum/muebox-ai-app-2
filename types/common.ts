// types/common.ts

export type WithTimestamps = {
    created_at: string;
    updated_at: string;
  }
  
  export type WithStatus = {
    status: Status;
  }
  
  export type Status = 'active' | 'inactive' | 'deleted' | 'pending';
  
  export type DbTimestamptz = string; // For TIMESTAMPTZ fields
  export type JsonB = Record<string, any>; // For JSONB fields
  
  export type UpdateTriggerHandler = {
    OLD: any;
    NEW: any;
    created_at: string;
    updated_at: string;
  }
  
  export type InsertTriggerHandler = {
    NEW: any;
    created_at: string;
  }
  
  export type DeleteTriggerHandler = {
    OLD: any;
    deleted_at: string;
  }
  
  // Status constants (if you still want to keep them here)
  export const STATUS: Record<string, Status> = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DELETED: 'deleted',
    PENDING: 'pending'
  } as const;
    
  // export type Status = typeof STATUS[keyof typeof STATUS];

  // Add any other common types here