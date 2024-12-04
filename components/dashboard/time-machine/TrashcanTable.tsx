// /components/dashboard/time-machine/TrashcanTable.tsx

import React from "react";
import { FileRow } from "@/types";

interface TrashcanTableProps {
  data: FileRow[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export const TrashcanTable: React.FC<TrashcanTableProps> = ({
  data,
  onRestore,
  onDelete,
  isLoading,
}) => {
  return (
    <div className="overflow-x-auto">
      {isLoading ? (
        <p className="text-gray-500">Loading deleted files...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-500">Trash is empty.</p>
      ) : (
        <table className="min-w-full border border-gray-300 dark:border-gray-700 rounded-md">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Size
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((file) => (
              <tr
                key={file.id}
                className="border-t border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                {file.file_name} {/* Changed from file.name to file.file_name */}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                  {file.category}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                  {file.size}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                  <button
                    onClick={() => onRestore(file.id)}
                    className="mr-2 text-blue-500 hover:underline"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => onDelete(file.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete Permanently
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
