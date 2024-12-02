// services/time-machine/types.ts

import { FileOperationResult, FileCategory, FileRow, FileStorageUsage } from "@/types/FileTypes";

export interface IArchiveService {
  getArchivedFiles(page?: number, limit?: number): Promise<{ files: (FileRow & { category: FileCategory })[]; total: number }>;
  getStorageUsage(): Promise<FileStorageUsage>;
  archiveFile(fileId: string): Promise<FileOperationResult>;
  bulkArchiveFiles(fileIds: string[]): Promise<FileOperationResult>;
  restoreFile(fileId: string): Promise<FileOperationResult>;
  bulkRestoreFiles(fileIds: string[]): Promise<FileOperationResult>;
  removeFromArchive(fileId: string): Promise<FileOperationResult>;
  restoreFromArchive(fileId: string): Promise<FileOperationResult>;
  searchArchivedFiles(query: string): Promise<(FileRow & { category: FileCategory })[]>;
  updateArchivedFileMetadata(fileId: string, metadata: Partial<Pick<FileRow, "tags" | "description">>): Promise<FileOperationResult>;
  bulkRemoveFromArchive(fileIds: string[]): Promise<FileOperationResult>;
}