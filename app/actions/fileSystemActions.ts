// app/actions/fileSystemActions.ts

'use server'

import { FileService } from '@/services/files/FileService';

export async function handleFileAction(action: string, fileId: string) {
  const fileService = new FileService();
  switch (action) {
    case 'share':
      return await fileService.shareFile(fileId);
    case 'move':
      return await fileService.moveFile(fileId, /* destination */);
    case 'star':
      return await fileService.starFile(fileId);
    case 'rename':
      return await fileService.renameFile(fileId, /* newName */);
    case 'download':
      return await fileService.getDownloadLink(fileId);
    case 'report':
      return await fileService.reportFile(fileId);
    case 'delete':
      return await fileService.deleteFile(fileId);
    default:
      throw new Error(`Unsupported action: ${action}`);
  }
}

export async function handleFolderAction(action: string, folderId: string) {
  const fileService = new FileService();
  switch (action) {
    case 'share':
      return await fileService.shareFolder(folderId);
    case 'move':
      return await fileService.moveFolder(folderId, /* destination */);
    case 'star':
      return await fileService.starFolder(folderId);
    case 'rename':
      return await fileService.renameFolder(folderId, /* newName */);
    case 'download':
      return await fileService.getFolderDownloadLink(folderId);
    case 'report':
      return await fileService.reportFolder(folderId);
    case 'delete':
      return await fileService.deleteFolder(folderId);
    default:
      throw new Error(`Unsupported action: ${action}`);
  }
}