// components/dashboard/files/FileFolders.tsx

import React, { useEffect, useState } from "react";
import { FileService } from "@/services/files/FileService";

interface FileFolderItem {
  id: string;
  name: string;
  type: "file" | "folder"; // Item type
  parent_id?: string; // ID of the parent folder (optional)
}

interface FileFoldersProps {
  searchQuery: string; // Filter input
}

const FileFolders: React.FC<FileFoldersProps> = ({ searchQuery }) => {
  const [items, setItems] = useState<FileFolderItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null); // Current folder ID
  const [folderHistory, setFolderHistory] = useState<string[]>([]); // Track navigation
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch items based on current folder
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedItems = currentFolder
          ? await FileService.getFilesByFolder(currentFolder)
          : await FileService.getFilesAndFolders();
        setItems(fetchedItems);
      } catch (err) {
        console.error("Error fetching items:", err);
        setError("Failed to load files and folders.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [currentFolder]);

  // Filter items based on searchQuery
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigate into a folder
  const openFolder = (folderId: string) => {
    setFolderHistory((prev) => [...prev, folderId]);
    setCurrentFolder(folderId);
  };

  // Navigate back to the parent folder
  const goBack = () => {
    const newHistory = [...folderHistory];
    newHistory.pop();
    setFolderHistory(newHistory);
    setCurrentFolder(newHistory[newHistory.length - 1] || null);
  };

  return (
    <div>
      {isLoading ? (
        <p className="text-gray-500">Loading files and folders...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Navigation Controls */}
          {folderHistory.length > 0 && (
            <button
              onClick={goBack}
              className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Back
            </button>
          )}

          {/* Display Items */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg hover:shadow-lg transition cursor-pointer"
                  onClick={item.type === "folder" ? () => openFolder(item.id) : undefined}
                >
                  <div className="flex items-center space-x-2">
                    {/* Display Icons */}
                    {item.type === "folder" ? (
                      <span className="text-yellow-500">📁</span>
                    ) : (
                      <span className="text-blue-500">📄</span>
                    )}
                    <h3 className="font-medium truncate">{item.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No items found.</p>
          )}
        </>
      )}
    </div>
  );
};

export default FileFolders;
