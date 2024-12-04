// components/dashboard/time-machine/ArchiveTable.tsx

import React, { useState } from "react";
import { FileRow } from "@/types";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/utils/formatters"; // We'll need to create this

interface ArchiveTableProps {
  data: FileRow[];
  onRestore: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const ArchiveTable: React.FC<ArchiveTableProps> = ({
  data,
  onRestore,
  onDelete,
  isLoading,
}) => {
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());

  const handleAction = async (action: 'restore' | 'delete', fileId: string) => {
    try {
      setProcessingFiles(prev => new Set(prev).add(fileId));
      if (action === 'restore') {
        await onRestore(fileId);
      } else {
        await onDelete(fileId);
      }
    } finally {
      setProcessingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="overflow-x-auto">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-500">Loading archived files...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-gray-500">No archived files found.</p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Archived Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((file) => (
              <tr key={file.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {file.file_name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {typeof file.size === 'number' 
                    ? formatFileSize(file.size) 
                    : file.size}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {file.category || file.type || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(file.archived_at || file.updated_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction('restore', file.id)}
                      disabled={processingFiles.has(file.id)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Restore
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction('delete', file.id)}
                      disabled={processingFiles.has(file.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};