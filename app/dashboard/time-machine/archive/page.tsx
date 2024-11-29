// app/dashboard/time-machine/archive/page.tsx

import React, { useEffect, useState } from "react";
import { ArchiveService } from "@/utils/services/ArchiveService";

// Define types for archive files and storage usage
type ArchivedFile = {
  id: string;
  name: string;
  size: number; // File size in MB
  updatedAt: string; // ISO date string
};

type StorageUsage = {
  used: number; // Used storage in GB
  total: number; // Total storage in GB
};

const Archive = () => {
  const [archiveFiles, setArchiveFiles] = useState<ArchivedFile[]>([]);
  const [storageUsage, setStorageUsage] = useState<StorageUsage>({
    used: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch archived files and storage usage
    const fetchArchiveData = async () => {
      try {
        setLoading(true);

        const [files, storage] = await Promise.all([
          ArchiveService.getArchivedFiles(),
          ArchiveService.getStorageUsage(),
        ]);

        // Transform files to include the `updatedAt` property if it's missing
        const transformedFiles: ArchivedFile[] = files.map((file) => ({
          ...file,
          updatedAt: file.updatedAt || new Date().toISOString(), // Provide a default if missing
        }));

        setArchiveFiles(transformedFiles);
        setStorageUsage(storage);
        setError(null);
      } catch (err) {
        console.error("Error fetching archive data:", err);
        setError("Failed to load archive data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchArchiveData();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Archive</h1>

      {/* Loading and Error States */}
      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          {/* Storage Visualization */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Storage Usage</h2>
            <div className="relative w-full h-6 bg-gray-200 rounded-md">
              <div
                className="absolute top-0 left-0 h-6 bg-blue-500 rounded-md"
                style={{
                  width: `${
                    storageUsage.total > 0
                      ? (storageUsage.used / storageUsage.total) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {storageUsage.used.toFixed(2)} GB of{" "}
              {storageUsage.total.toFixed(2)} GB used
            </p>
          </div>

          {/* Archived Files */}
          {archiveFiles.length === 0 ? (
            <p className="text-gray-500">No archived files available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {archiveFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-4 border rounded-lg hover:shadow-lg transition"
                >
                  <h3 className="font-medium truncate">{file.name}</h3>
                  <p className="text-sm text-gray-500">{file.size} MB</p>
                  <p className="text-xs text-gray-400">
                    Updated: {new Date(file.updatedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Archive;
