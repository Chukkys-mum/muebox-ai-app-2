// /components/dashboard/files/FileSettings.tsx

import React, { useState, useEffect } from "react";
import FileService from "@/services/files/FileService";
import { FileSettings as FileSettingsType } from "@/types";

const FileSettings = () => {
  const fileService = new FileService();
  
  const [settings, setSettings] = useState<FileSettingsType>({
    id: 0,
    maxFileSize: 10,
    allowedFileTypes: ["jpg", "png", "pdf", "docx"],
    updated_at: new Date().toISOString(),
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await fileService.getFileSettings();
      if (data) setSettings(data);
    };
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: name === "allowedFileTypes" 
        ? value ? value.split(",").map((type) => type.trim()) : null
        : name === "maxFileSize" ? (value ? Number(value) : null) : value,
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    const success = await fileService.updateFileSettings(settings);
    if (success) {
      // Optionally, show a success message
    } else {
      // Optionally, show an error message
    }
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
            value={settings.maxFileSize ?? ''}
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
            value={settings.allowedFileTypes ? settings.allowedFileTypes.join(", ") : ''}
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