// /components/dashboard/files/FileSettings.tsx

import React, { useState, useEffect } from "react";
import { FileService } from "@/services/files/FileService";

const FileSettings = () => {
  const [settings, setSettings] = useState<{ maxFileSize: number; allowedFileTypes: string[] }>({
    maxFileSize: 10, // Default: 10 MB
    allowedFileTypes: ["jpg", "png", "pdf", "docx"], // Default types as an array
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await FileService.getFileSettings();
      if (data) setSettings(data);
    };
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: name === "allowedFileTypes" ? value.split(",").map((type) => type.trim()) : value,
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    await FileService.updateFileSettings(settings);
    setIsSaving(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">File Settings</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Max File Size (MB)
          </label>
          <input
            type="number"
            name="maxFileSize"
            value={settings.maxFileSize}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Allowed File Types (comma-separated)
          </label>
          <input
            type="text"
            name="allowedFileTypes"
            value={settings.allowedFileTypes.join(", ")} // Convert array to a comma-separated string for display
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <button
          onClick={saveSettings}
          disabled={isSaving}
          className={`mt-4 px-4 py-2 rounded-md ${
            isSaving
              ? "bg-gray-400 text-gray-700"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default FileSettings;
