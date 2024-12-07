// components/dashboard/team-management/TeamListTable.tsx
'use client';

import { useMemo } from 'react';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import { BaseDataTable } from '@/components/dashboard/shared/BaseDataTable';
import { DataTableProps, TeamRow } from '@/types/tables';

const columnHelper = createColumnHelper<TeamRow>();

export const teamColumns: ColumnDef<TeamRow, any>[] = [
  columnHelper.accessor('name', {
    header: "Team Name",
    cell: (info) => info.getValue(),
  }),
  
  columnHelper.accessor('user_id', {
    header: "User",
    cell: (info) => (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
        {info.getValue()}
      </span>
    ),
  }),
  
  columnHelper.accessor('role_id', {
    header: "Role",
    cell: (info) => (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
        {info.getValue()}
      </span>
    ),
  }),

  columnHelper.accessor('status', {
    header: "Status",
    cell: (info) => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        info.getValue() === 'active'
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
      }`}>
        {info.getValue()}
      </span>
    ),
  }),

  columnHelper.accessor('description', {
    header: "Description",
    cell: (info) => info.getValue() || 'No description provided',
  }),
  
  columnHelper.accessor('created_at', {
    header: "Created",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
];

export function TeamListTable({
  config,
  data,
  onDelete,
  isLoading
}: DataTableProps<TeamRow>) {
  const columns = useMemo(() => teamColumns, []);

  return (
    <BaseDataTable
      config={{
        ...config,
        columns,
        tableName: 'teams',
        baseRoute: '/dashboard/user-management/teams',
        searchableColumns: ['name', 'description', 'status', 'user_id', 'role_id'],
      }}
      data={data}
      onDelete={onDelete}
      isLoading={isLoading}
    />
  );
}

export default TeamListTable;