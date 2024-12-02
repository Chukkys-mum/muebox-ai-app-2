// components/common/Modal.tsx
// A reusable modal component.

import React, { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean; // Controls the visibility of the modal
  onClose: () => void; // Function to close the modal
  title?: string; // Optional title for the modal
  children: ReactNode; // Modal content
  footer?: ReactNode; // Optional footer for actions like Save, Cancel
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Modal Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 max-w-lg">
        {/* Modal Header */}
        {title && (
          <div className="px-6 py-4 border-b border-gray-300 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          </div>
        )}

        {/* Modal Body */}
        <div className="px-6 py-4">{children}</div>

        {/* Modal Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-300 dark:border-gray-700 flex justify-end space-x-2">
            {footer}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Modal;
