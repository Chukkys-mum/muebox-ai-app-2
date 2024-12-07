// components/dashboard/account-settings/logs/LoginSessions.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Filter from '@/components/dashboard/shared/Filter';
import LogsTable, { Column } from '@/components/dashboard/shared/LogsTable';
import Pagination from '@/components/dashboard/shared/Pagination';
import { Monitor, Smartphone, Globe, Clock } from 'lucide-react';
import api from '@/utils/api-client';

interface LoginSessionEntry {
  id: string;
  user_id: string;
  location: string;
  status: 'active' | 'inactive' | 'error';
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  ipAddress: string;
  lastActive: string;
  metadata?: Record<string, any>;
}

interface SessionTableRow {
  id: string;
  location: string;
  status: 'active' | 'inactive' | 'error';
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  ipAddress: string;
  lastActive: string;
}

const LoginSessions: React.FC = () => {
  const { toast } = useToast();
  const [data, setData] = useState<SessionTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [timeRange, setTimeRange] = useState('1_day');
  const [totalPages, setTotalPages] = useState(1);

  const fetchLoginSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.loginSessions.list({ page, timeRange });
      setData(response.data);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch login sessions';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoginSessions();
  }, [page, timeRange]);

  const renderDeviceInfo = (row: SessionTableRow) => {
    const DeviceIcon = row.deviceType === 'desktop' ? Monitor : Smartphone;
    return (
      <div className="device-indicator">
        <DeviceIcon className="device-icon" />
        <span>{row.browser} - {row.device}</span>
      </div>
    );
  };

  const renderLocation = (location: string) => {
    return (
      <div className="location-badge">
        <Globe className="w-4 h-4" />
        <span>{location}</span>
      </div>
    );
  };

  const renderStatus = (status: SessionTableRow['status']) => {
    const statusConfig = {
      active: { label: 'Active', className: 'session-status-ok' },
      inactive: { label: 'Inactive', className: 'session-status-warn' },
      error: { label: 'Error', className: 'session-status-err' },
    };

    const config = statusConfig[status];
    return (
      <span className={`session-status ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const columns: Column[] = [
    {
      header: 'Location',
      accessorKey: 'location',
      cell: ({ row }: { row: { original: SessionTableRow } }) => 
        renderLocation(row.original.location),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: { row: { original: SessionTableRow } }) => 
        renderStatus(row.original.status),
    },
    {
      header: 'Device',
      accessorKey: 'device',
      cell: ({ row }: { row: { original: SessionTableRow } }) => 
        renderDeviceInfo(row.original),
    },
    {
      header: 'IP Address',
      accessorKey: 'ipAddress',
      cell: ({ row }: { row: { original: SessionTableRow } }) => (
        <span className="font-mono text-sm">
          {row.original.ipAddress}
        </span>
      ),
    },
    {
      header: 'Last Active',
      accessorKey: 'lastActive',
      cell: ({ row }: { row: { original: SessionTableRow } }) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {row.original.lastActive}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: ({ row }: { row: { original: SessionTableRow } }) => (
        <button 
          onClick={() => console.log('Terminate session:', row.original.id)}
          className="logs-action-button hover:bg-destructive hover:text-destructive-foreground"
        >
          Terminate
        </button>
      ),
    },
  ];

  if (loading) {
    return <div className="logs-loading">Loading login sessions...</div>;
  }

  if (error) {
    return <div className="logs-error">{error}</div>;
  }

  return (
    <div className="logs-content">
      <div className="logs-filter-bar">
        <Filter
          label="Time Range"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          options={[
            { value: '1_hour', label: 'Last Hour' },
            { value: '1_day', label: 'Last 24 Hours' },
            { value: '1_week', label: 'Last Week' },
            { value: 'all', label: 'All Time' },
          ]}
        />
      </div>

      <div className="logs-table-container">
        <LogsTable 
          columns={columns} 
          data={data}
          className="logs-table"
        />
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default LoginSessions;