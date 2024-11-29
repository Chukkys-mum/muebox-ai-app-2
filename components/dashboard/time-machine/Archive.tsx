// components/time-machine/Archive.tsx

import React, { useState, useEffect } from "react";
import { FileRow } from "@/types/FileTypes";
import { FileService } from "@/services/files/FileService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArchiveTable } from "./ArchiveTable";
import { useRouter } from "next/navigation";

const Archive: React.FC = () => {
  const [archivedFiles, setArchivedFiles] = useState<FileRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchArchivedFiles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const files = await FileService.getArchivedFiles(); // Fetch archived files from the database
        setArchivedFiles(files);
      } catch (err) {
        console.error("Error fetching archived files:", err);
        setError("Failed to load archived files.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArchivedFiles();
  }, []);

  const handleRestore = async (fileId: string) => {
    try {
      const success = await FileService.restoreFile(fileId);
      if (success) {
        setArchivedFiles((prev) => prev.filter((file) => file.id !== fileId));
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
      const success = await FileService.deleteFile(fileId);
      if (success) {
        setArchivedFiles((prev) => prev.filter((file) => file.id !== fileId));
      } else {
        setError("Failed to delete file permanently.");
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      setError("An error occurred while deleting the file.");
    }
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
