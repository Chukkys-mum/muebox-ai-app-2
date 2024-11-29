// File: /components/dashboard/files/FolderListGrid.tsx

import React from "react";

interface Folder {
  id: string;
  name: string;
  size: string | number; // Can be string if coming from a backend
  modifiedAt: string; // ISO date string
}

interface FolderListGridProps {
  folders: Folder[];
  onAction: (action: string, folderId: string) => void;
}

const FolderListGrid: React.FC<FolderListGridProps> = ({ folders, onAction }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {folders.map((folder) => {
        const folderSize = typeof folder.size === "string" ? parseFloat(folder.size) : folder.size;
        const formattedSize = folderSize > 1024 ? (folderSize / 1024).toFixed(2) + " MB" : folderSize + " KB";

        return (
          <div
            key={folder.id}
            className="border border-gray-300 dark:border-gray-700 rounded-md p-4 flex flex-col justify-between"
          >
            <div>
              {/* Folder Name */}
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{folder.name}</h3>
              {/* Folder Size */}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Size: {formattedSize}
              </p>
              {/* Last Modified */}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Modified: {new Date(folder.modifiedAt).toLocaleDateString()}
              </p>
            </div>
            {/* Actions */}
            <div className="mt-4">
              <button
                onClick={() => onAction("open", folder.id)}
                className="text-blue-500 hover:underline mr-2"
              >
                Open
              </button>
              <button
                onClick={() => onAction("rename", folder.id)}
                className="text-green-500 hover:underline mr-2"
              >
                Rename
              </button>
              <button
                onClick={() => onAction("delete", folder.id)}
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

export default FolderListGrid;
