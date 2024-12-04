// /utils/fileIcons.ts

import { 
    FiFile, 
    FiFileText, 
    FiImage, 
    FiVideo, 
    FiMusic, 
    FiCode, 
    FiArchive,
    FiPaperclip 
  } from 'react-icons/fi';
  import { IconType } from 'react-icons';
  
  const fileTypeMap: Record<string, IconType> = {
    // Documents
    'pdf': FiFileText,
    'doc': FiFileText,
    'docx': FiFileText,
    'txt': FiFileText,
    
    // Images
    'jpg': FiImage,
    'jpeg': FiImage,
    'png': FiImage,
    'gif': FiImage,
    'svg': FiImage,
    
    // Video
    'mp4': FiVideo,
    'mov': FiVideo,
    'avi': FiVideo,
    
    // Audio
    'mp3': FiMusic,
    'wav': FiMusic,
    'ogg': FiMusic,
    
    // Code
    'js': FiCode,
    'ts': FiCode,
    'jsx': FiCode,
    'tsx': FiCode,
    'html': FiCode,
    'css': FiCode,
    
    // Archives
    'zip': FiArchive,
    'rar': FiArchive,
    '7z': FiArchive,
  };
  
  export const getFileIcon = (extension: string): IconType => {
    const ext = extension.toLowerCase().replace('.', '');
    return fileTypeMap[ext] || FiFile;
  };