// /components/dashboard/files/FileDetailsModal.tsx

import React from "react";

interface FileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    id: string;
    name: string;
    size: string;
    type: string;
    createdAt: string;
    modifiedAt: string;
    sharedWith?: string[];
    tags?: string[];
  };
}

const FileDetailsModal: React.FC<FileDetailsModalProps> = ({
  isOpen,
  onClose,
  file,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-1/3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            File Details
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <ul className="mb-4">
          <li>
            <strong>Name:</strong> {file.name}
          </li>
          <li>
            <strong>Type:</strong> {file.type}
          </li>
          <li>
            <strong>Size:</strong> {file.size}
          </li>
          <li>
            <strong>Created At:</strong> {file.createdAt}
          </li>
          <li>
            <strong>Last Modified:</strong> {file.modifiedAt}
          </li>
          {file.sharedWith && (
            <li>
              <strong>Shared With:</strong> {file.sharedWith.join(", ")}
            </li>
          )}
          {file.tags && (
            <li>
              <strong>Tags:</strong> {file.tags.join(", ")}
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
          <button className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 text-white">
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileDetailsModal;
