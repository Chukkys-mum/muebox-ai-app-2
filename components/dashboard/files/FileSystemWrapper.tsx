// app/components/FileSystemWrapper.tsx
import { FileService } from '@/services/files/FileService';
import FileListGrid from '@/components/dashboard/files/FileListGrid';
import FolderListGrid from '@/components/dashboard/files/FolderListGrid';

export default async function FileSystemWrapper() {
  const fileService = new FileService();
  const files = await fileService.fetchFiles();
  const folders = await fileService.fetchFolders();

  return (
    <>
      <FolderListGrid folders={folders} />
      <FileListGrid files={files} />
    </>
  );
}