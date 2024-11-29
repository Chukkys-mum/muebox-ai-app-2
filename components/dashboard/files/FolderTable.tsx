// components/dashboard/files/FolderTable.tsx
// Displays folders in a table format.

import React from "react";

interface FolderRow {
  id: string;
  name: string;
  createdAt: string;
}

interface FolderTableProps {
  folders: FolderRow[];
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
}

const FolderTable: React.FC<FolderTableProps> = ({ folders, onDelete, onOpen }) => {
  return (
    <table className="min-w-full border border-gray-300 rounded-md">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">Created At</th>
          <th className="px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {folders.map((folder) => (
          <tr key={folder.id} className="border-t">
            <td className="px-4 py-2">{folder.name}</td>
            <td className="px-4 py-2">{new Date(folder.createdAt).toLocaleDateString()}</td>
            <td className="px-4 py-2 space-x-2">
              <button
                onClick={() => onOpen(folder.id)}
                className="px-2 py-1 bg-blue-500 text-white rounded-md"
              >
                Open
              </button>
              <button
                onClick={() => onDelete(folder.id)}
                className="px-2 py-1 bg-red-500 text-white rounded-md"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default FolderTable;
