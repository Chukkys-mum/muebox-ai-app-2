// components/dashboard/files/FolderDetailsModal.tsx

import React from "react";

interface FolderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: {
    id: string;
    name: string;
    createdAt: string;
    modifiedAt: string;
    numberOfFiles: number;
    size: string;
    tags?: string[];
  };
}

const FolderDetailsModal: React.FC<FolderDetailsModalProps> = ({
  isOpen,
  onClose,
  folder,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-1/3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Folder Details
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <ul className="mb-4">
          <li>
            <strong>Name:</strong> {folder.name}
          </li>
          <li>
            <strong>Number of Files:</strong> {folder.numberOfFiles}
          </li>
          <li>
            <strong>Size:</strong> {folder.size}
          </li>
          <li>
            <strong>Created At:</strong> {folder.createdAt}
          </li>
          <li>
            <strong>Last Modified:</strong> {folder.modifiedAt}
          </li>
          {folder.tags && (
            <li>
              <strong>Tags:</strong> {folder.tags.join(", ")}
            </li>
          )}
        </ul>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-800"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 text-white">
            Open Folder
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderDetailsModal;
