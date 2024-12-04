// components/dashboard/time-machine/Archive.tsx

import React, { useState, useEffect } from "react";
import { FileRow } from "@/types";
import { fileService } from "@/services/files/FileService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArchiveTable } from "./ArchiveTable";
import { useRouter } from "next/navigation";

const Archive: React.FC = () => {
  const [archivedFiles, setArchivedFiles] = useState<FileRow[]>([]);
  const [storageUsage, setStorageUsage] = useState<{
    used: number;
    total: number;
    breakdown: Record<string, number>;
  }>({ used: 0, total: 0, breakdown: {} });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const fetchArchiveData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch both archived files and storage usage in parallel
      const [filesData, usage] = await Promise.all([
        fileService.getArchivedFiles(currentPage, 10),
        fileService.getArchivedStorageUsage()
      ]);

      setArchivedFiles(filesData.files);
      setStorageUsage(usage);
    } catch (err) {
      console.error("Error fetching archive data:", err);
      setError("Failed to load archived files.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArchiveData();
  }, [currentPage]);

  const handleRestore = async (fileId: string) => {
    try {
      const success = await fileService.restoreFromArchive(fileId);
      if (success) {
        setArchivedFiles((prev) => prev.filter((file) => file.id !== fileId));
        // Refresh storage usage after restoration
        const usage = await fileService.getArchivedStorageUsage();
        setStorageUsage(usage);
      } else {
        setError("Failed to restore file.");
      }
    } catch (err) {
      console.error("Error restoring file:", err);
      setError("An error occurred while restoring the file.");
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const success = await fileService.deleteFile(fileId);
      if (success) {
        setArchivedFiles((prev) => prev.filter((file) => file.id !== fileId));
        // Refresh storage usage after deletion
        const usage = await fileService.getArchivedStorageUsage();
        setStorageUsage(usage);
      } else {
        setError("Failed to delete file permanently.");
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      setError("An error occurred while deleting the file.");
    }
  };

  const formatStorageSize = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  return (
    <div className="p-6">
      <Card className="p-6 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Archive
          </h1>
          <Button
            onClick={() => router.push("/dashboard/files")}
            variant="outline"
          >
            Back to Files
          </Button>
        </div>

        {/* Storage Usage Display */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Storage Usage</h2>
          <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{
                width: `${(storageUsage.used / storageUsage.total) * 100}%`,
              }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {formatStorageSize(storageUsage.used)} of {formatStorageSize(storageUsage.total)} used
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <ArchiveTable
          data={archivedFiles}
          onRestore={handleRestore}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
};

export default Archive;