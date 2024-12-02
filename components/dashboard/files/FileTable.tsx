// components/dashboard/files/FileTable.tsx
// Displays file data in a table with sorting and filtering options. 

import React, { useState } from "react";
import FileActionsDropdown from "./FileActionsDropdown";
import { FileRow, FileTableProps } from "@/types/FileTypes";

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
      <table className="min-w-full">
        {/* ... (table header code) ... */}
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
                    {file[column.key]?.toString()}
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
