// components/dashboard/account-settings/logs/AuditLog.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Filter from '@/components/dashboard/shared/Filter';
import LogsTable, { Column } from '@/components/dashboard/shared/LogsTable';
import Pagination from '@/components/dashboard/shared/Pagination';
import { Download } from 'lucide-react';
import api from '@/utils/api-client';

interface AuditLogEntry {
  id: string;
  logDate: string;
  method: string;
  endpoint: string;
  statusCode: number;
  record: string;
  metadata: any;
}

interface AuditTableRow {
  id: string;
  logDate: string;
  method: string;
  endpoint: string;
  statusCode: number;
  record: string;
  metadata: any;
}

const AuditLog: React.FC = () => {
  const { toast } = useToast();
  const [data, setData] = useState<AuditTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [timeRange, setTimeRange] = useState<string>('1_week');
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.auditLogs.list({ page, timeRange });
      setData(response.data);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch audit logs';
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
    fetchAuditLogs();
  }, [page, timeRange]);

  const renderStatusCode = (statusCode: number) => {
    const statusClass = 
      statusCode >= 500 ? 'audit-status-500' :
      statusCode >= 400 ? 'audit-status-404' :
      'audit-status-200';

    return (
      <span className={`audit-log-status ${statusClass}`}>
        {statusCode}
      </span>
    );
  };

  const handleDownloadReport = () => {
    toast({
      title: 'Download Started',
      description: 'Your audit log report is being generated.',
    });
  };

  const columns: Column[] = [
    {
      header: 'Date',
      accessorKey: 'logDate',
    },
    {
      header: 'Method',
      accessorKey: 'method',
      cell: ({ row }: { row: { original: AuditTableRow } }) => (
        <span className="font-mono text-sm">
          {row.original.method}
        </span>
      ),
    },
    {
      header: 'Endpoint',
      accessorKey: 'endpoint',
      cell: ({ row }: { row: { original: AuditTableRow } }) => (
        <span className="font-mono text-sm truncate max-w-[200px]">
          {row.original.endpoint}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'statusCode',
      cell: ({ row }: { row: { original: AuditTableRow } }) => 
        renderStatusCode(row.original.statusCode),
    },
    {
      header: 'Record',
      accessorKey: 'record',
      cell: ({ row }: { row: { original: AuditTableRow } }) => (
        <span className="truncate max-w-[200px]">
          {row.original.record}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: ({ row }: { row: { original: AuditTableRow } }) => (
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
    return <div className="logs-loading">Loading audit logs...</div>;
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
        <button 
          onClick={handleDownloadReport}
          className="logs-download-button"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Report
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

export default AuditLog;