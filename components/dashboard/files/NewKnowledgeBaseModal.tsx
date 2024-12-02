// components/dashboard/files/NewKnowledgeBaseModal.tsx
//  Modal for creating new knowledge bases.

import React, { useState } from "react";
import Modal from "@/components/common/Modal"; // Assuming a reusable Modal component

interface NewKnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
}

const NewKnowledgeBaseModal: React.FC<NewKnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    onSave(name, description);
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Knowledge Base">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Knowledge Base Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NewKnowledgeBaseModal;
