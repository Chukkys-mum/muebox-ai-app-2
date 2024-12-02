// components/dashboard/files/NewFolderModal.tsx
// Modal for creating folders in files and in a knowledge base.

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog"; // Using shadcn Dialog instead of Modal

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (folderName: string) => void;
}

const NewFolderModal: React.FC<NewFolderModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [folderName, setFolderName] = useState("");

  const handleCreate = () => {
    if (folderName.trim()) {
      onCreate(folderName);
      setFolderName("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Create New Folder</Dialog.Title>
        </Dialog.Header>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Folder Name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <div className="flex justify-end space-x-2">
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              disabled={!folderName.trim()}
            >
              Create
            </button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};

export default NewFolderModal;