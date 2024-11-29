// app/dashboard/files/page.tsx

'use client';

import SearchBar from "@/components/dashboard/files/SearchBar";
import NewKnowledgeBaseModal from "@/components/dashboard/files/NewKnowledgeBaseModal";
import NewFolderModal from "@/components/dashboard/files/NewFolderModal";
import FolderTable from "@/components/dashboard/files/FolderTable";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DashboardWrapper from '@/components/layout/DashboardWrapper';
import { FileRow } from '@/types/FileTypes';
import React from 'react';
import FileTable from '@/components/dashboard/files/FileTable';
import { FileService } from '@/utils/services/FileService';

// Define fileColumns
const fileColumns: Array<{ key: keyof FileRow; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'size', label: 'Size' },
  { key: 'type', label: 'Type' },
  { key: 'modifiedAt', label: 'Modified At' },
];

export default function FileManagerPage() {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      try {
        const fetchedFiles = await FileService.fetchFiles();
        // Map backend fields to match `FileRow` type
        const mappedFiles = fetchedFiles.map((file) => ({
          ...file,
          modifiedAt: file.modified_at, // Map `modified_at` to `modifiedAt`
        }));
        setFiles(mappedFiles);
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleDelete = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => FileService.deleteFile(id)));
      setFiles(files.filter((file) => !ids.includes(file.id)));
    } catch (error) {
      console.error('Error deleting files:', error);
    }
  };

  return (
    <DashboardWrapper title="File Manager" description="Manage your files and folders.">
      <div className="p-6">
        <Card className="p-6 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">File Manager</h1>
            <Button
              onClick={() => router.push('/dashboard/file-manager/new')}
              variant="outline"
            >
              Upload File
            </Button>
          </div>
          <FileTable
            data={files}
            onDelete={handleDelete}
            isLoading={isLoading}
            config={{
              tableName: 'files',
              columns: fileColumns,
              searchableColumns: ['name', 'size', 'type', 'modifiedAt'], // Ensure keys match FileRow type
            }}
          />
        </Card>
      </div>
    </DashboardWrapper>
  );
}
