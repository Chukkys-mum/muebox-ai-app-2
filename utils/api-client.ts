// utils/api-client.ts
import {
  ActivityLog,
  UserDetails,
  Product,
  Subscription,
} from '@/types';

// Device interfaces
interface Device {
  id: string;
  browser: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  location: string;
  lastActive: string;
  status: 'active' | 'inactive';
}

interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: {
    totalPages?: number;
    totalCount?: number;
  };
}

interface PaginationParams {
  page: number;
  timeRange: string;
}

const api = {
  accounts: {
    create: async (accountName: string): Promise<ApiResponse<any>> => {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: accountName }),
      });

      if (!response.ok) {
        throw new Error('Failed to create account');
      }

      return response.json();
    },
  },

  activityLogs: {
    list: async (params: PaginationParams): Promise<ApiResponse<ActivityLog[]>> => {
      const res = await fetch(
        `/api/activity-log?page=${params.page}&timeRange=${params.timeRange}`
      );
      if (!res.ok) throw new Error('Failed to fetch activity logs');
      return res.json();
    },
  },

  auditLogs: {
    list: async (params: PaginationParams): Promise<ApiResponse<any[]>> => {
      const res = await fetch(
        `/api/audit-log?page=${params.page}&timeRange=${params.timeRange}`
      );
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      return res.json();
    },
  },

  loginSessions: {
    list: async (params: PaginationParams): Promise<ApiResponse<any[]>> => {
      const res = await fetch(
        `/api/login-sessions?page=${params.page}&timeRange=${params.timeRange}`
      );
      if (!res.ok) throw new Error('Failed to fetch login sessions');
      return res.json();
    },
  },

  devices: {
    list: async (): Promise<ApiResponse<Device[]>> => {
      const res = await fetch('/api/devices');
      if (!res.ok) throw new Error('Failed to fetch devices');
      return res.json();
    },
    reset: async (): Promise<ApiResponse<void>> => {
      const res = await fetch('/api/devices/reset', {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to reset devices');
      return res.json();
    },
  },

  user: {
    getCurrent: async (): Promise<ApiResponse<UserDetails>> => {
      const res = await fetch('/api/user/current');
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    getCurrentDetails: async (): Promise<ApiResponse<UserDetails>> => {
      const res = await fetch('/api/user-details/current');
      if (!res.ok) throw new Error('Failed to fetch user details');
      return res.json();
    },
  },

  products: {
    list: async (): Promise<ApiResponse<Product[]>> => {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
    getById: async (id: string): Promise<ApiResponse<Product>> => {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error('Failed to fetch product');
      return res.json();
    },
  },

  subscriptions: {
    getCurrent: async (): Promise<ApiResponse<Subscription>> => {
      const res = await fetch('/api/subscriptions/current');
      if (!res.ok) throw new Error('Failed to fetch subscription');
      return res.json();
    },
  },

  roles: {
    list: async (): Promise<ApiResponse<any[]>> => {
      const res = await fetch('/api/roles');
      if (!res.ok) throw new Error('Failed to fetch roles');
      return res.json();
    },
  },
};

export default api;

// You might want to export these interfaces if they're used elsewhere
export type { ApiResponse, PaginationParams, Device };
