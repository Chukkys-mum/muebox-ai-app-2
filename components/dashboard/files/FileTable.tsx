// components/dashboard/files/FileTable.tsx
// Displays file data in a table with sorting and filtering options. 

import React, { useState } from "react";
import FileActionsDropdown from "./FileActionsDropdown";

// Define props for FileTable
interface FileRow {
  id: string; // Unique ID for each file
  name: string; // Name of the file
  size: string; // Size of the file
  type: string; // Type of the file (e.g., folder, document, image)
  modifiedAt: string; // Last modified date
}

interface FileTableProps {
  data: FileRow[];
  onDelete: (ids: string[]) => Promise<void>;
  isLoading: boolean;
  config: {
    tableName: string;
    columns: Array<{ key: keyof FileRow; label: string }>;
    searchableColumns: Array<keyof FileRow>;
  };
}

const FileTable: React.FC<FileTableProps> = ({ data, onDelete, isLoading, config }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Handle actions triggered from the dropdown
  const handleAction = (action: string, fileId: string) => {
    console.log(`${action} action triggered on file with ID: ${fileId}`);
    if (action === "delete") {
      onDelete([fileId]);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRows.length > 0) {
      await onDelete(selectedRows);
      setSelectedRows([]);
    }
  };

  // Handle row selection
  const toggleRowSelection = (fileId: string) => {
    setSelectedRows((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  // Filter data based on the search query
  const filteredData = data.filter((file) =>
    config.searchableColumns.some((key) =>
      file[key]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex justify-between items-center">
        {/* Search Bar */}
        <input
          type="text"
          placeholder={`Search ${config.tableName}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-sm p-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
        />

        {/* Bulk Delete Button */}
        <button
          onClick={handleBulkDelete}
          disabled={selectedRows.length === 0 || isLoading}
          className={`ml-4 px-4 py-2 text-sm font-medium text-white rounded-md ${
            selectedRows.length > 0
              ? "bg-red-500 hover:bg-red-600"
              : "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
          }`}
        >
          Delete Selected
        </button>
      </div>

      <table className="min-w-full border border-gray-300 dark:border-gray-700 rounded-md">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRows(data.map((file) => file.id));
                  } else {
                    setSelectedRows([]);
                  }
                }}
                checked={selectedRows.length === data.length && data.length > 0}
              />
            </th>
            {config.columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {column.label}
              </th>
            ))}
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
              Actions
            </th>
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
              <tr
                key={file.id}
                className={`border-t border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 ${
                  selectedRows.includes(file.id) ? "bg-gray-100 dark:bg-gray-800" : ""
                }`}
              >
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(file.id)}
                    onChange={() => toggleRowSelection(file.id)}
                  />
                </td>
                {config.columns.map((column) => (
                  <td key={column.key} className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                    {file[column.key]}
                  </td>
                ))}
                <td className="px-4 py-2">
                  <FileActionsDropdown
                    onAction={(action) => handleAction(action, file.id)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={config.columns.length + 2} className="text-center py-4">
                No files available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FileTable;
