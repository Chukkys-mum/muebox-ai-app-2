// types/logs.ts

import { WithTimestamps } from './common';

// Audit Log interface
export interface AuditLog extends WithTimestamps {
  id: string;
  user_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, any>;
  description?: string;
}

// Activity Log interface
export interface ActivityLog extends WithTimestamps {
  id: string;
  user_id: string;
  action: string;
  details?: Record<string, any>;
}

// Login Session interface
export interface LoginSession {
  id: string;
  user_id: string;
  ip_address?: string;
  device?: string;
  logged_in_at: string;
  logged_out_at?: string;
  status: 'active' | 'expired' | 'logged_out';
}

// Recent Device interface
export interface RecentDevice extends WithTimestamps {
  id: string;
  user_id: string;
  device?: string;
  ip_address?: string;
  last_used_at: string;
}

// You can add more log-related types or interfaces here as needed

// For example, you might want to add types for different log levels:

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

// System Log interface
export interface SystemLog extends WithTimestamps {
  id: string;
  level: LogLevel;
  message: string;
  source: string;
  stack_trace?: string;
  metadata?: Record<string, any>;
}

// Error Log interface
export interface ErrorLog extends WithTimestamps {
  id: string;
  error_code: string;
  error_message: string;
  stack_trace: string;
  user_id?: string;
  request_data?: Record<string, any>;
  environment_data?: Record<string, any>;
}

// Performance Log interface
export interface PerformanceLog extends WithTimestamps {
  id: string;
  operation: string;
  duration: number; // in milliseconds
  resource_usage?: {
    cpu?: number;
    memory?: number;
    disk_io?: number;
  };
  metadata?: Record<string, any>;
}

// Log Query interface
export interface LogQuery {
  start_date?: string;
  end_date?: string;
  user_id?: string;
  action?: string;
  entity_type?: string;
  level?: LogLevel;
  limit?: number;
  offset?: number;
}

// Log Export Format
export type LogExportFormat = 'csv' | 'json' | 'xml';

// Log Export Options
export interface LogExportOptions {
  format: LogExportFormat;
  start_date: string;
  end_date: string;
  log_types: ('audit' | 'activity' | 'system' | 'error' | 'performance')[];
  include_metadata: boolean;
}