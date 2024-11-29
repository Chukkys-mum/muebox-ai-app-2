// /components/dashboard/time-machine/TrashCan.tsx

import React, { useEffect, useState } from "react";
import { TrashService } from "@/utils/services/TrashService";

// Define the type for a trashed file
type TrashedFile = {
  id: string;
  name: string;
  size: number;
  deletedAt: string;
};

// Define props for TrashCan
interface TrashCanProps {
  userId: string;
}

const TrashCan: React.FC<TrashCanProps> = ({ userId }) => {
  const [trashedFiles, setTrashedFiles] = useState<TrashedFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch trashed files on component mount for the given userId
    const fetchTrashedFiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const files = await TrashService.getTrashedFiles(userId);
        setTrashedFiles(files);
      } catch (err) {
        console.error("Error fetching trashed files:", err);
        setError("Failed to load trashed files.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrashedFiles();
  }, [userId]);

  const handleRestore = async (fileId: string) => {
    try {
      await TrashService.restoreFile(fileId);
      setTrashedFiles((prev) => prev.filter((file) => file.id !== fileId));
      setSelectedFiles((prev) => prev.filter((id) => id !== fileId));
    } catch (error) {
      console.error("Error restoring file:", error);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await TrashService.deleteFile(fileId);
      setTrashedFiles((prev) => prev.filter((file) => file.id !== fileId));
      setSelectedFiles((prev) => prev.filter((id) => id !== fileId));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleBulkRestore = async () => {
    try {
      await Promise.all(selectedFiles.map((fileId) => TrashService.restoreFile(fileId)));
      setTrashedFiles((prev) => prev.filter((file) => !selectedFiles.includes(file.id)));
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error restoring files:", error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedFiles.map((fileId) => TrashService.deleteFile(fileId)));
      setTrashedFiles((prev) => prev.filter((file) => !selectedFiles.includes(file.id)));
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error deleting files:", error);
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} KB`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} MB`;
    return `${(size / (1024 * 1024)).toFixed(2)} GB`;
  };

  const filteredFiles = trashedFiles.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Trash</h1>

      {/* Search Bar */}
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md p-2 border border-gray-300 rounded-md text-sm"
        />
        <div className="ml-4">
          <button
            onClick={handleBulkRestore}
            disabled={selectedFiles.length === 0}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              selectedFiles.length > 0
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Restore Selected
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={selectedFiles.length === 0}
            className={`ml-2 px-4 py-2 text-sm font-medium text-white rounded-md ${
              selectedFiles.length > 0
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Delete Selected
          </button>
        </div>
      </div>

      {/* Loading and Error States */}
      {isLoading && <p className="text-gray-500">Loading trashed files...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Trashed Files */}
      {!isLoading && !error && (
        <>
          {filteredFiles.length === 0 ? (
            <p className="text-gray-500">No files in trash.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`p-4 border rounded-lg hover:shadow-lg transition ${
                    selectedFiles.includes(file.id) ? "bg-gray-100" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => toggleFileSelection(file.id)}
                    className="mb-2"
                  />
                  <h3 className="font-medium truncate">{file.name}</h3>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  <p className="text-xs text-gray-400">Deleted: {file.deletedAt}</p>
                  <div className="mt-2 flex justify-between">
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => handleRestore(file.id)}
                    >
                      Restore
                    </button>
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => handleDelete(file.id)}
                    >
                      Delete Permanently
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrashCan;
