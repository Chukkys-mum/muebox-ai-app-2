// /components/dashboard/time-machine/TrashCan.tsx

import React, { useEffect, useState } from "react";
import TrashService from "@/services/time-machine/TrashService";
import { TrashcanTable } from "./TrashcanTable";
import { FileRow } from "@/types"; 

interface TrashCanProps {
  userId: string;
}

const TrashCan: React.FC<TrashCanProps> = ({ userId }) => {
  const [trashedFiles, setTrashedFiles] = useState<FileRow[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    const fetchTrashedFiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { files } = await TrashService.getTrashedFiles(page, limit);
        setTrashedFiles(files);
      } catch (err) {
        console.error("Error fetching trashed files:", err);
        setError("Failed to load trashed files.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrashedFiles();
  }, [userId, page, limit]);

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

  const filteredFiles = trashedFiles.filter((file) =>
    file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
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

      {/* Trashcan Table */}
      {!isLoading && !error && (
        <TrashcanTable
          data={filteredFiles}
          onRestore={handleRestore}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default TrashCan;
