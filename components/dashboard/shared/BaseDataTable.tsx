// components/shared/BaseDataTable.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import CardMenu from '@/components/card/CardMenu';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { 
  createColumnHelper, 
  useReactTable, 
  getCoreRowModel, 
  flexRender,
  type ColumnDef,
  type Row,
  type Column,
  type Table as TableInstance,
  type HeaderContext,
  type CellContext
} from '@tanstack/react-table';
import { 
  DataTableProps, 
  BaseTableEntity, 
  SortDescriptor,
  TableConfig
} from '@/types/tables';

export function BaseDataTable<T extends BaseTableEntity>({
  config,
  data,
  onDelete,
  isLoading
}: DataTableProps<T>) {
  const router = useRouter();
  const { toast } = useToast();
  
  // State management
  const [sortState, setSortState] = useState<SortDescriptor>(
    config.defaultSort ?? { column: '', direction: 'ascending' }
  );
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Process and sort data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter if searchable columns are defined
    if (searchTerm && config.searchableColumns && config.searchableColumns.length > 0) {
      filtered = filtered.filter(item =>
        config.searchableColumns!.some(column =>
          String(item[column as keyof T] || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortState.column && sortState.direction) {
      filtered.sort((a, b) => {
        const aValue = a[sortState.column as keyof T];
        const bValue = b[sortState.column as keyof T];
        const modifier = sortState.direction === 'ascending' ? 1 : -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue) * modifier;
        }
        return ((aValue > bValue) ? 1 : -1) * modifier;
      });
    }

    return filtered;
  }, [data, searchTerm, sortState, config.searchableColumns]);

  // Pagination calculations
  const totalPages = Math.ceil(processedData.length / rowsPerPage);
  const paginatedData = processedData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Table configuration
  const table = useReactTable({
    data: paginatedData,
    columns: config.columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Handlers
  const handleSort = (column: string) => {
    setSortState(prev => ({
      column,
      direction: prev.column === column
        ? prev.direction === 'ascending' ? 'descending' : 'ascending'
        : 'ascending'
    }));
  };

  const handleDelete = (ids: string | string[]) => {
    const itemIds = Array.isArray(ids) ? ids : [ids];
    setItemsToDelete(itemIds);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemsToDelete.length || !onDelete) return;
    setIsDeleting(true);
    
    try {
      await onDelete(itemsToDelete);
      
      toast({
        title: "Success",
        description: `Successfully deleted ${itemsToDelete.length} item(s)`,
      });
      
      setSelectedKeys(new Set());
    } catch (error) {
      console.error('Error deleting items:', error);
      toast({
        title: "Error",
        description: "Failed to delete items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setItemsToDelete([]);
    }
  };

  const toggleSelectAll = () => {
    setSelectedKeys(prev => 
      prev.size === paginatedData.length
        ? new Set()
        : new Set(paginatedData.map(item => item.id))
    );
  };

  const toggleSelectRow = (id: string) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Card className="h-full w-full p-0 dark:border-zinc-800 sm:overflow-auto">
      {/* Table Header Controls */}
      <div className="p-4 flex justify-between items-center border-b dark:border-zinc-800">
        <div className="flex items-center space-x-4">
          {Boolean(config.searchableColumns?.length) && (
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          )}
          {selectedKeys.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(Array.from(selectedKeys))}
            >
              Delete Selected ({selectedKeys.size})
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`${config.baseRoute}/new`)}
          >
            Create New
          </Button>
          <select
            className="px-2 py-1 border rounded dark:bg-zinc-800"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
          </select>
        </div>
      </div>
  
      {/* Table Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : !processedData.length ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-sm text-zinc-500">No items found</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedKeys.size === paginatedData.length}
                  onChange={toggleSelectAll}
                  className="rounded border-zinc-300 dark:border-zinc-700"
                />
              </TableHead>
              {table.getAllColumns().map((column) => (
                <TableHead
                  key={column.id}
                  onClick={() => handleSort(column.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    {flexRender(
                      column.columnDef.header,
                      {
                        table,
                        column,
                        header: {
                          id: column.id,
                          index: column.getIndex(),
                          column: column,
                          colSpan: 1,
                          rowSpan: 1,
                          depth: 0,
                          headerGroup: table.getHeaderGroups()[0],
                          subHeaders: [],
                          isPlaceholder: false,
                          placeholderId: undefined,
                          getContext: function() {
                            return {
                              table,
                              column,
                              header: this
                            };
                          },
                          getLeafHeaders: () => [],
                          getResizeHandler: () => (event: unknown) => {},  // Fixed return type
                          getSize: () => 0,
                          getStart: () => 0
                        }
                      }
                    )}
                    {sortState.column === column.id && (
                      sortState.direction === 'ascending' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedKeys.has(row.original.id)}
                    onChange={() => toggleSelectRow(row.original.id)}
                    className="rounded border-zinc-300 dark:border-zinc-700"
                  />
                </TableCell>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      { 
                        table, 
                        column: cell.column, 
                        row: cell.row,
                        cell,
                        getValue: cell.getValue,
                        renderValue: cell.renderValue  // Changed from getRenderValue to renderValue
                      }
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <CardMenu
                    options={[
                      {
                        label: 'View',
                        action: () => router.push(`${config.baseRoute}/view/${row.original.id}`),
                      },
                      {
                        label: 'Edit',
                        action: () => router.push(`${config.baseRoute}/edit/${row.original.id}`),
                      },
                      {
                        label: 'Delete',
                        action: () => handleDelete(row.original.id),
                        className: 'text-red-600',
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
  
      {/* Pagination Controls */}
      <div className="p-4 border-t dark:border-zinc-800 flex justify-between items-center">
        <span className="text-sm text-zinc-500">
          Showing {((page - 1) * rowsPerPage) + 1} to {Math.min(page * rowsPerPage, processedData.length)} of {processedData.length}
        </span>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i}
              variant={page === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
  
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {itemsToDelete.length} item(s)?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default BaseDataTable;