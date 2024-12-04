// File: /components/dashboard/files/FileListGrid.tsx

import React from "react";
import { FileRow } from "@/types";
import FileActionsDropdown from './FileActionsDropdown';
import type { FileAction } from '@/types';
import { FiFile } from "react-icons/fi";
import { formatFileSize } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { getFileIcon } from "@/utils/fileIcons";

interface FileListGridProps {
  files: FileRow[];
  onAction: (action: FileAction, fileId: string) => void;
  isLoading?: boolean;
}

const FileListGrid: React.FC<FileListGridProps> = ({ files, onAction, isLoading }) => {
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

  if (!files.length) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No files found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => {
        const FileIcon = getFileIcon(file.extension || '');
        const formattedSize = formatFileSize(file.size);

        return (
          <div
            key={file.id}
            className="group border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 
                     dark:hover:border-gray-600 transition-all duration-200 bg-white dark:bg-gray-800"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                  <FileIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                    {file.file_name}
                  </h3>
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <p>{formattedSize}</p>
                    <p>Modified: {new Date(file.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <FileActionsDropdown 
                onAction={(action) => onAction(action, file.id)} 
                disabled={isLoading}
              />
            </div>
            {file.description && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {file.description}
              </p>
            )}
            {file.tags && file.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {file.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                             bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FileListGrid;
