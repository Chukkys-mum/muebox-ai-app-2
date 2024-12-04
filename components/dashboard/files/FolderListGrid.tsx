// File: /components/dashboard/files/FolderListGrid.tsx

import React from "react";
import { FileRow } from "@/types";
import FolderActionsDropdown from './FolderActionsDropdown';
import type { FileAction } from '@/types';
import { FiFolder } from "react-icons/fi";
import { formatFileSize } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";

interface FolderListGridProps {
  folders: FileRow[];
  onAction: (action: FileAction, folderId: string) => void;
  isLoading?: boolean;
}

const FolderListGrid: React.FC<FolderListGridProps> = ({ folders, onAction, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!folders.length) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No folders found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {folders.map((folder) => {
        const formattedSize = formatFileSize(folder.size);

        return (
          <div
            key={folder.id}
            className="group border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 
                     dark:hover:border-gray-600 transition-all duration-200 bg-white dark:bg-gray-800"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                  <FiFolder className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                    {folder.file_name}
                  </h3>
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <p>{formattedSize}</p>
                    <p>Modified: {new Date(folder.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <FolderActionsDropdown 
                onAction={(action) => onAction(action, folder.id)} 
                disabled={isLoading}
              />
            </div>
            {folder.description && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {folder.description}
              </p>
            )}
            {folder.is_shared && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                               bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Shared
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FolderListGrid;
