// File: /components/dashboard/files/FileListGrid.tsx

import React from "react";

interface File {
  id: string;
  name: string;
  size: string | number; // Can be string if coming from a backend
  type: string;
  modifiedAt: string; // ISO date string
}

interface FileListGridProps {
  files: File[];
  onAction: (action: string, fileId: string) => void;
}

const FileListGrid: React.FC<FileListGridProps> = ({ files, onAction }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => {
        // Convert size to a number if it's a string
        const fileSize = typeof file.size === "string" ? parseFloat(file.size) : file.size;

        // Format size for display (e.g., KB, MB, GB)
        const formattedSize =
          fileSize > 1024
            ? fileSize > 1024 * 1024
              ? (fileSize / (1024 * 1024)).toFixed(2) + " GB"
              : (fileSize / 1024).toFixed(2) + " MB"
            : fileSize + " KB";

        return (
          <div
            key={file.id}
            className="border border-gray-300 dark:border-gray-700 rounded-md p-4 flex flex-col justify-between"
          >
            <div>
              {/* File Name */}
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{file.name}</h3>
              {/* File Size */}
              <p className="text-sm text-gray-600 dark:text-gray-400">Size: {formattedSize}</p>
              {/* Last Modified */}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Modified: {new Date(file.modifiedAt).toLocaleDateString()}
              </p>
            </div>
            {/* Actions */}
            <div className="mt-4">
              <button
                onClick={() => onAction("download", file.id)}
                className="text-blue-500 hover:underline mr-2"
              >
                Download
              </button>
              <button
                onClick={() => onAction("rename", file.id)}
                className="text-green-500 hover:underline mr-2"
              >
                Rename
              </button>
              <button
                onClick={() => onAction("delete", file.id)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FileListGrid;
