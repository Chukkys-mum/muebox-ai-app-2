// components/dashboard/files/FileTable.tsx

// Displays file data in a table with sorting and filtering options. 
import React, { useState, useCallback } from 'react';
import { FileRow, FileAction, FileTableProps, SortState, FilterState } from '@/types';
import { Table } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import FileActionsDropdown from './FileActionsDropdown';
import { formatFileSize } from '@/utils/formatters';
import {
  Search,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Filter,
  SlidersHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FileTable({
  data,
  onDelete,
  onAction,
  isLoading,
  config,
}: FileTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortState, setSortState] = useState<SortState>();
  const [filterState, setFilterState] = useState<FilterState>({});
  const [showFilters, setShowFilters] = useState(false);

  // Handle selecting individual items
  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  // Sort data with proper type handling
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      if (!sortState) return 0;
      
      const aValue = a[sortState.column];
      const bValue = b[sortState.column];
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      const modifier = sortState.direction === 'asc' ? 1 : -1;
      
      // Type-specific comparisons
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * modifier;
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * modifier;
      }
      
      // Default comparison
      return String(aValue).localeCompare(String(bValue)) * modifier;
    });
  }, [data, sortState]);

  // Filter and search data
  const filteredData = React.useMemo(() => {
    return sortedData.filter((file) => {
      // Search query filter
      const matchesSearch = searchQuery === "" || config.searchableColumns.some((key) =>
        String(file[key])?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Type filter
      const matchesType = !filterState.type || file.type === filterState.type;

      // Category filter
      const matchesCategory = !filterState.category || file.category === filterState.category;

      // Date range filter
      const matchesDateRange = !filterState.dateRange || (
        new Date(file.created_at) >= filterState.dateRange.start &&
        new Date(file.created_at) <= filterState.dateRange.end
      );

      return matchesSearch && matchesType && matchesCategory && matchesDateRange;
    });
  }, [sortedData, searchQuery, filterState, config.searchableColumns]);

  const handleSort = useCallback((column: keyof FileRow) => {
    setSortState(prev => ({
      column,
      direction: prev?.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleBatchAction = useCallback(async (action: FileAction) => {
    if (selectedIds.size === 0) return;

    if (action === 'delete') {
      await handleDeleteSelected();
    } else {
      // Handle other batch actions
      Array.from(selectedIds).forEach(id => onAction(action, id));
    }
    setSelectedIds(new Set());
  }, [selectedIds, onAction]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.size > 0) {
      await onDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  }, [selectedIds, onDelete]);

  // Render table with selected files
  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${config.tableName}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Files</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 py-4">
              {/* Filter content */}
              <div className="space-y-2">
                <label className="text-sm font-medium">File Type</label>
                <Select
                  value={filterState.type}
                  onValueChange={(value) => 
                    setFilterState(prev => ({ ...prev, type: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file">Files</SelectItem>
                    <SelectItem value="folder">Folders</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={filterState.category}
                  onValueChange={(value) => 
                    setFilterState(prev => ({ ...prev, category: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {['image', 'video', 'audio', 'document', 'code', 'archive'].map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {selectedIds.size > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Batch Actions ({selectedIds.size})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleBatchAction('move')}>
                Move Selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBatchAction('copy')}>
                Copy Selected
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => handleBatchAction('delete')}
              >
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <thead>
            <tr>
              <th className="w-12">
                <Checkbox
                  checked={selectedIds.size === filteredData.length && filteredData.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedIds(new Set(filteredData.map(file => file.id)));
                    } else {
                      setSelectedIds(new Set());
                    }
                  }}
                />
              </th>
              {config.columns.map((column) => (
                <th 
                  key={column.key}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {sortState?.column === column.key ? (
                      sortState.direction === 'asc' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    )}
                  </div>
                </th>
              ))}
              <th className="w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={config.columns.length + 2} className="text-center py-4">
                  Loading files...
                </td>
              </tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((file) => (
                <tr key={file.id}>
                  <td className="w-12">
                    <Checkbox
                      checked={selectedIds.has(file.id)}
                      onCheckedChange={(checked) => handleSelectOne(file.id, !!checked)}
                    />
                  </td>
                  {config.columns.map((column) => (
                    <td key={column.key}>
                      {column.key === 'size' 
                        ? formatFileSize(file.size)
                        : String(file[column.key] ?? '')}
                    </td>
                  ))}
                  <td>
                    <FileActionsDropdown
                      onAction={(action) => onAction(action, file.id)}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={config.columns.length + 2} className="text-center py-4">
                  No files found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}