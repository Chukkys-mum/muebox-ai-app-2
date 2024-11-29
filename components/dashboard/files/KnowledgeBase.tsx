// /components/dashboard/files/KnowledgeBase.tsx

import React, { useEffect, useState } from "react";
import { KnowledgeBaseService } from "@/services/files/KnowledgeBaseService";

// Define the type for Knowledge Base files
type FileRow = {
  id: string;
  name: string;
  size: string | number;
  updated_at?: string; // Add updated_at for compatibility with backend response
};

type KnowledgeBaseFile = {
  id: string;
  name: string;
  size: number;
  updatedAt: string;
};

const KnowledgeBase = () => {
  const [knowledgeBaseFiles, setKnowledgeBaseFiles] = useState<KnowledgeBaseFile[]>([]);
  const [storageUsage, setStorageUsage] = useState<{ used: number; total: number }>({
    used: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch files and storage usage on mount
    const fetchKnowledgeBaseData = async () => {
      try {
        setIsLoading(true);

        // Fetch data from the service
        const files: FileRow[] = await KnowledgeBaseService.getKnowledgeBaseFiles();
        const storage = await KnowledgeBaseService.getStorageUsage();

        // Transform the data to match KnowledgeBaseFile type
        const transformedFiles: KnowledgeBaseFile[] = files.map((file) => ({
          id: file.id,
          name: file.name,
          size: typeof file.size === "string" ? parseFloat(file.size) : file.size,
          updatedAt: file.updated_at || new Date().toISOString(), // Map updated_at to updatedAt with fallback
        }));

        setKnowledgeBaseFiles(transformedFiles);
        setStorageUsage(storage);
        setError(null);
      } catch (err) {
        console.error("Error fetching Knowledge Base data:", err);
        setError("Failed to fetch Knowledge Base data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchKnowledgeBaseData();
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Knowledge Base</h1>

      {/* Storage Usage Visualization */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Storage Usage</h2>
        <div className="bg-gray-200 h-6 rounded-md">
          <div
            className="bg-green-500 h-6 rounded-md"
            style={{
              width: `${(storageUsage.used / storageUsage.total) * 100}%`,
            }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {storageUsage.used.toFixed(2)} GB of {storageUsage.total.toFixed(2)} GB used
        </p>
      </div>

      {/* Files in Knowledge Base */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {knowledgeBaseFiles.map((file) => (
          <div
            key={file.id}
            className="p-4 border rounded-lg hover:shadow-lg transition"
          >
            <h3 className="font-medium truncate">{file.name}</h3>
            <p className="text-sm text-gray-500">{file.size.toFixed(2)} MB</p>
            <p className="text-xs text-gray-400">
              Updated: {new Date(file.updatedAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;
