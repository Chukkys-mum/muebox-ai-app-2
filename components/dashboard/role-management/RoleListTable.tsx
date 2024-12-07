// components/dashboard/role-management/RoleListTable.tsx
'use client';

import { useMemo } from 'react';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import { BaseDataTable } from '@/components/dashboard/shared/BaseDataTable';
import { DataTableProps, RoleRow } from '@/types/tables';

const columnHelper = createColumnHelper<RoleRow>();

export const roleColumns: ColumnDef<RoleRow, any>[] = [
  columnHelper.accessor('name', {
    header: "Role Name",
    cell: (info) => info.getValue(),
  }),
  
  columnHelper.accessor('permission_scheme_id', {
    header: "Permission Scheme",
    cell: (info) => (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
        {info.getValue() || 'No scheme assigned'}
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
];

export function RoleListTable({
  config,
  data,
  onDelete,
  isLoading
}: DataTableProps<RoleRow>) {
  const columns = useMemo(() => roleColumns, []);

  return (
    <BaseDataTable
      config={{
        ...config,
        columns,
        tableName: 'roles',
        baseRoute: '/dashboard/user-management/roles',
        searchableColumns: ['name', 'status'],
      }}
      data={data}
      onDelete={onDelete}
      isLoading={isLoading}
    />
  );
}

export default RoleListTable;