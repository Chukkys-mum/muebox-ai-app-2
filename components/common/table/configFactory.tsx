// /utils/table/configFactory.tsx
import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { TableConfig, BaseTableEntity } from "@/types/tables";
import CardMenu from "@/components/card/CardMenu";
import { Checkbox } from "@/components/ui/checkbox";

export function createTableConfig<T extends BaseTableEntity>(
  entityType: 'permissions' | 'roles' | 'users' | 'teams',
  options?: Partial<TableConfig<T>>
): TableConfig<T> {
  const baseColumns: ColumnDef<T>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(!!checked)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
    },
    {
      accessorKey: 'name',
      header: () => <div className="text-left">Name</div>,
      cell: ({ row }) => (
        <div className="text-left font-medium">
          {row.getValue('name')}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: () => <div className="text-left">Status</div>,
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <div className="text-left">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
              }`}
            >
              {status}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: () => <div className="text-left">Created At</div>,
      cell: ({ row }) => (
        <div className="text-left">
          {new Date(row.getValue('created_at')).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <CardMenu
          vertical
          options={[
            {
              label: 'View',
              action: () => options?.actions?.onView?.(row.original)
            },
            {
              label: 'Edit',
              action: () => options?.actions?.onEdit?.(row.original)
            },
            {
              label: 'Delete',
              action: () => options?.actions?.onDelete?.([row.original.id]),
              className: 'text-red-600 dark:text-red-400'
            }
          ]}
        />
      ),
    },
  ];

  const baseConfig: TableConfig<T> = {
    tableName: entityType,
    columns: baseColumns,
    baseRoute: `/dashboard/user-management/${entityType}`,
    defaultSort: { column: 'created_at', direction: 'descending' },
    actions: options?.actions
  };

  return {
    ...baseConfig,
    ...options
  };
}