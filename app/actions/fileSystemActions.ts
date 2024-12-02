// app/actions/fileSystemActions.ts

'use server'

import { FileService } from '@/services/files/FileService';
import type { FileOperationResult } from '@/types/FileTypes';

interface ActionParams {
  newName?: string;
  destinationId?: string | null;
}

export async function handleEntityAction(
  action: string, 
  entityId: string, 
  entityType: 'file' | 'folder',
  params?: ActionParams
): Promise<FileOperationResult | string> {
  const fileService = new FileService();

  switch (action) {
    case 'share':
      return entityType === 'file' 
        ? await fileService.shareFile(entityId)
        : await fileService.shareFolder(entityId);
    case 'move':
      return await fileService.moveFile(entityId, params?.destinationId || null);
    case 'star':
      return entityType === 'file'
        ? await fileService.starFile(entityId)
        : await fileService.starFolder(entityId);
    case 'rename':
      if (!params?.newName) throw new Error('New name required');
      return entityType === 'file'
        ? await fileService.renameFile(entityId, params.newName)
        : await fileService.renameFolder(entityId, params.newName);
    case 'download':
      return entityType === 'file'
        ? await fileService.getDownloadLink(entityId)
        : await fileService.getFolderDownloadLink(entityId);
    case 'report':
      return entityType === 'file'
        ? await fileService.reportFile(entityId)
        : await fileService.reportFolder(entityId);
    case 'delete':
      return await fileService.deleteFile(entityId);
    default:
      throw new Error(`Unsupported action: ${action}`);
  }
}