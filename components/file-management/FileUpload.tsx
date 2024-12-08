// components/file-management/FileUpload.tsx

import React from 'react';

// Define the props interface
export interface FileUploadProps {
  file: File | null; // Accepts a File object or null
  onFileChange: (file: File | null) => void; // Callback when a file is uploaded
}

// FileUpload Component
const FileUpload: React.FC<FileUploadProps> = ({ file, onFileChange }) => {
  return (
    <div>
      <label htmlFor="file-upload" className="file-upload-label">
        Drag and drop or browse your files
        <input
          id="file-upload"
          type="file"
          className="file-upload-input"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          accept=".jpg, .png, .gif, .pdf"
        />
      </label>
      {/* Display uploaded file details */}
      {file && (
        <p className="file-upload-details">
          Uploaded file: <strong>{file.name}</strong>
        </p>
      )}
    </div>
  );
};

export default FileUpload;
