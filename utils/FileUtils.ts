// /utils/FileUtils.ts

import { FileRow } from "@/types"; // Adjust the path to where files is located

/**
 * Utility function to categorize a file based on its extension.
 * @param extension - File extension (e.g., .jpg, .pdf).
 * @returns The file's category (e.g., image, video, document, etc.).
 */
export const getFileCategory = (extension: string): FileRow["category"] => {
  const extensionMap: Record<string, FileRow["category"]> = {
    ".jpg": "image",
    ".jpeg": "image",
    ".png": "image",
    ".gif": "image",
    ".bmp": "image",
    ".tiff": "image",
    ".svg": "image",
    ".mp4": "video",
    ".avi": "video",
    ".mov": "video",
    ".mkv": "video",
    ".webm": "video",
    ".mp3": "audio",
    ".wav": "audio",
    ".ogg": "audio",
    ".flac": "audio",
    ".aac": "audio",
    ".pdf": "document",
    ".doc": "document",
    ".docx": "document",
    ".xls": "document",
    ".xlsx": "document",
    ".ppt": "document",
    ".pptx": "document",
    ".txt": "document",
    ".rtf": "document",
    ".js": "code",
    ".jsx": "code",
    ".ts": "code",
    ".tsx": "code",
    ".rb": "code",
    ".py": "code",
    ".java": "code",
    ".cpp": "code",
    ".c": "code",
    ".html": "code",
    ".css": "code",
    ".json": "code",
    ".xml": "code",
    ".zip": "archive",
    ".rar": "archive",
    ".tar": "archive",
    ".tar.gz": "archive",
    ".7z": "archive",
    ".md": "other",
    ".env": "other",
    ".log": "other",
  };

  return extensionMap[extension.toLowerCase()] || "other";
};
