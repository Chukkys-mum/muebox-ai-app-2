// components/dashboard/account-settings/logs/ActivityLog.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Filter from '@/components/dashboard/shared/Filter';
import LogsTable, { Column } from '@/components/dashboard/shared/LogsTable';
import Pagination from '@/components/dashboard/shared/Pagination';
import api from '@/utils/api-client';
import { ActivityLogEntry } from '@/types/types';

// Define the status type for activity logs
type ActivityStatus = 'success' | 'warning' | 'error';

// Define the shape of the data we'll use in the table
interface ActivityTableRow {
  id: string;
  name: string;
  activity: string;
  entity: string;
  lineManager: string;
  activityDate: string;
  manage: string;
  status: ActivityStatus;
}

// Function to transform API data to table data
const transformActivityLog = (log: ActivityLogEntry): ActivityTableRow => {
  return {
    id: log.id,
    name: log.name,
    activity: log.activity,
    entity: log.entity,
    lineManager: log.lineManager,
    activityDate: log.activityDate,
    manage: log.manage,
    // Map the API status to our defined status types
    status: (log.status as ActivityStatus) || 'success'
  };
};

const ActivityLog: React.FC = () => {
  const { toast } = useToast();
  const [data, setData] = useState<ActivityTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [timeRange, setTimeRange] = useState<string>('1_day');
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchActivityLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.activityLogs.list({ page, timeRange });
      // Transform the API response data to match our table structure
      const transformedData = response.data.map(transformActivityLog);
      setData(transformedData);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch activity logs';
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
    fetchActivityLogs();
  }, [page, timeRange]);

  const renderStatus = (status: ActivityStatus) => (
    <span className={`log-status log-status-${status}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  const columns: Column[] = [
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'Activity',
      accessorKey: 'activity',
    },
    {
      header: 'Entity',
      accessorKey: 'entity',
    },
    {
      header: 'Line Manager',
      accessorKey: 'lineManager',
    },
    {
      header: 'Activity Date',
      accessorKey: 'activityDate',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: { row: { original: ActivityTableRow } }) => renderStatus(row.original.status),
    },
    {
      header: 'Actions',
      accessorKey: 'manage',
      cell: ({ row }: { row: { original: ActivityTableRow } }) => (
        <button 
          onClick={() => console.log('View details:', row.original.id)}
          className="logs-action-button"
        >
          View Details
        </button>
      ),
    },
  ];

  if (loading) {
    return <div className="logs-loading">Loading activity logs...</div>;
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
            { value: '1_day', label: 'Last 24 Hours' },
            { value: '1_week', label: 'Last Week' },
            { value: '1_month', label: 'Last Month' },
            { value: 'all', label: 'All Time' },
          ]}
        />
        <button className="logs-download-button">
          View All
        </button>
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

export default ActivityLog;