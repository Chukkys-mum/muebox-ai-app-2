// components/dashboard/users/UserListTable.tsx
'use client';

import { useMemo } from 'react';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import { BaseDataTable } from '@/components/dashboard/shared/BaseDataTable';
import { DataTableProps, UserRow } from '@/types/tables';

const columnHelper = createColumnHelper<UserRow>();

export const userColumns: ColumnDef<UserRow, any>[] = [
  columnHelper.accessor('name', {
    header: "Name",
    cell: (info) => info.getValue(),
  }),
  
  columnHelper.accessor('email', {
    header: "Email",
    cell: (info) => info.getValue(),
  }),
  
  columnHelper.accessor('username', {
    header: "Username",
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

  columnHelper.accessor('company_id', {
    header: "Company",
    cell: (info) => (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
        {info.getValue()}
      </span>
    ),
  }),

  columnHelper.accessor('credits', {
    header: "Credits",
    cell: (info) => info.getValue().toString(),
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

export function UserListTable({
  config,
  data,
  onDelete,
  isLoading
}: DataTableProps<UserRow>) {
  const columns = useMemo(() => userColumns, []);

  return (
    <BaseDataTable
      config={{
        ...config,
        columns,
        tableName: 'users',
        baseRoute: '/dashboard/users',
        searchableColumns: ['name', 'email', 'username', 'description', 'status'],
      }}
      data={data}
      onDelete={onDelete}
      isLoading={isLoading}
    />
  );
}

export default UserListTable;