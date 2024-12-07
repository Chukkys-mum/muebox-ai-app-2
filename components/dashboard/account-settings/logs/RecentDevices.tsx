// components/dashboard/account-settings/logs/RecentDevices.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Filter from '@/components/dashboard/shared/Filter';
import LogsTable, { Column } from '@/components/dashboard/shared/LogsTable';
import { Monitor, Smartphone, Globe, Clock } from 'lucide-react';
import api from '@/utils/api-client';
import { Device } from '@/utils/api-client';

interface DeviceTableRow {
  id: string;
  browser: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  location: string;
  lastActive: string;
  status: 'active' | 'inactive';
}

const RecentDevices: React.FC = () => {
  const { toast } = useToast();
  const [devices, setDevices] = useState<DeviceTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.devices.list();
      setDevices(response.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch devices';
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
    fetchDevices();
  }, []);

  const handleReset = async () => {
    try {
      await api.devices.reset();
      toast({
        title: 'Success',
        description: 'All devices have been logged out.',
      });
      fetchDevices();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset devices.',
        variant: 'destructive',
      });
    }
  };

  const columns: Column[] = [
    {
      header: 'Browser',
      accessorKey: 'browser',
      cell: ({ row }: { row: { original: DeviceTableRow } }) => {
        const DeviceIcon = row.original.deviceType === 'desktop' ? Monitor : Smartphone;
        return (
          <div className="device-indicator">
            <DeviceIcon className="device-icon" />
            <span>{row.original.browser}</span>
          </div>
        );
      },
    },
    {
      header: 'Device',
      accessorKey: 'device',
      cell: ({ row }: { row: { original: DeviceTableRow } }) => (
        <span>{row.original.device}</span>
      ),
    },
    {
      header: 'Location',
      accessorKey: 'location',
      cell: ({ row }: { row: { original: DeviceTableRow } }) => (
        <div className="location-badge">
          <Globe className="w-4 h-4" />
          <span>{row.original.location}</span>
        </div>
      ),
    },
    {
      header: 'Last Activity',
      accessorKey: 'lastActive',
      cell: ({ row }: { row: { original: DeviceTableRow } }) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {row.original.lastActive}
        </div>
      ),
    },
  ];

  if (loading) {
    return <div className="logs-loading">Loading devices...</div>;
  }

  if (error) {
    return <div className="logs-error">{error}</div>;
  }

  return (
    <div className="logs-content">
      <div className="logs-table-container">
        <LogsTable 
          columns={columns} 
          data={devices}
          className="logs-table"
        />
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={handleReset}
          className="logs-action-button hover:bg-destructive hover:text-destructive-foreground"
        >
          Sign out all devices
        </button>
      </div>
    </div>
  );
};

export default RecentDevices;