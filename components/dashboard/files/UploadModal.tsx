// components/dashboard/files/UploadModal.tsx
// Modal for uploading files with progress tracking.

import React, { useState } from "react";

interface UploadModalProps {
  onClose: () => void; // Callback to close the modal
  onUploadSuccess: () => void; // Callback for successful upload
  maxUploadSize?: number; // Optional: Max upload size in bytes
}

const UploadModal: React.FC<UploadModalProps> = ({
  onClose,
  onUploadSuccess,
  maxUploadSize = 20 * 1024 * 1024 * 1024, // Default max size 20GB
}) => {
  const [queue, setQueue] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [errorFiles, setErrorFiles] = useState<string[]>([]);

  // Handle file selection
  const handleFileSelection = (files: FileList | null) => {
    if (!files) return;

    const newQueue = Array.from(files).filter((file) => {
      if (file.size > maxUploadSize) {
        setErrorFiles((prev) => [...prev, file.name]);
        return false;
      }
      return true;
    });

    setQueue((prevQueue) => [...prevQueue, ...newQueue]);
  };

  // Simulated file upload
  const handleUpload = async () => {
    setUploading(true);
    setErrorFiles([]);
    const newProgress: Record<string, number> = {};

    try {
      for (const file of queue) {
        newProgress[file.name] = 0;
        setProgress({ ...newProgress });

        // Simulate upload progress
        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            newProgress[file.name] += 10; // Increment progress
            setProgress({ ...newProgress });

            if (newProgress[file.name] >= 100) {
              clearInterval(interval);
              resolve();
            }
          }, 300); // Simulated interval
        });

        console.log(`Uploaded: ${file.name}`);
      }

      setQueue([]);
      onUploadSuccess(); // Notify successful upload
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  // Remove file from queue
  const removeFile = (fileName: string) => {
    setQueue((prevQueue) => prevQueue.filter((file) => file.name !== fileName));
  };

  // Cancel upload
  const cancelUpload = () => {
    setUploading(false);
    setQueue([]);
    setProgress({});
    onClose(); // Notify modal close
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-1/2">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Upload Files
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* File Input */}
        <input
          type="file"
          multiple
          onChange={(e) => handleFileSelection(e.target.files)}
          className="mb-4 w-full p-2 border rounded-md"
        />

        {/* Error Messages */}
        {errorFiles.length > 0 && (
          <div className="text-sm text-red-500 mb-4">
            The following files exceed the maximum size limit of {maxUploadSize / (1024 * 1024 * 1024)}GB:
            <ul className="list-disc list-inside">
              {errorFiles.map((file, idx) => (
                <li key={idx}>{file}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload Queue */}
        <ul className="mb-4">
          {queue.map((file) => (
            <li key={file.name} className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {file.name}
              </span>
              {uploading ? (
                <span className="text-sm text-blue-500">
                  {progress[file.name] || 0}%
                </span>
              ) : (
                <button
                  onClick={() => removeFile(file.name)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={cancelUpload}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={!uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={uploading || queue.length === 0}
          >
            {uploading ? "Uploading..." : "Start Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
