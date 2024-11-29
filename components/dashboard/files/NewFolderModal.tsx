// components/dashboard/files/NewFolderModal.tsx
// Modal for creating folders in files and in a knowledge base.

import React, { useState } from "react";
import Modal from "@/components/common/Modal";

const NewFolderModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  const handleCreate = () => {
    console.log(`Folder Created: ${folderName}`);
    setFolderName("");
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Create New Folder
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New Folder"
        footer={
          <>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Create
            </button>
          </>
        }
      >
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Enter folder name"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </Modal>
    </>
  );
};

export default NewFolderModal;
