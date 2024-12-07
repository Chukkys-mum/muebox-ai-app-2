// components/dashboard/permission-management/PermissionListTable.tsx
'use client';

import { useMemo } from 'react';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import { BaseDataTable } from '@/components/dashboard/shared/BaseDataTable';
import { DataTableProps, PermissionRow } from '@/types/tables';

const columnHelper = createColumnHelper<PermissionRow>();

export const permissionColumns: ColumnDef<PermissionRow, any>[] = [
  columnHelper.accessor('name', {
    header: "Permission Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('description', {
    header: "Description",
    cell: (info) => info.getValue() || 'No description provided',
  }),
  columnHelper.accessor('entity_type', {
    header: "Entity Type",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('permission_level', {
    header: "Permission Level",
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
  columnHelper.accessor('created_at', {
    header: "Created",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor('personality_profile_id', {
    header: "Profile",
    cell: (info) => (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
        {info.getValue() || 'No profile'}
      </span>
    ),
  }),
];

export function PermissionListTable({ 
  config, 
  data, 
  onDelete, 
  isLoading 
}: DataTableProps<PermissionRow>) {
  const columns = useMemo(() => permissionColumns, []);

  return (
    <BaseDataTable
      config={{
        ...config,
        columns,
        tableName: 'permissions',
        baseRoute: '/dashboard/user-management/permissions',
        searchableColumns: ['name', 'description', 'entity_type', 'permission_level', 'status'],
      }}
      data={data}
      onDelete={onDelete}
      isLoading={isLoading}
    />
  );
}

export default PermissionListTable;