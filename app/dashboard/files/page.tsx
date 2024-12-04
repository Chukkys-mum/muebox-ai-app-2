// app/dashboard/files/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import FileTable from '@/components/dashboard/files/FileTable';
import { FileService } from '@/services/files/FileService';
import { FileRow } from '@/types';

// Define fileColumns
const fileColumns: Array<{ key: keyof FileRow; label: string }> = [
  { key: 'file_name', label: 'Name' },
  { key: 'size', label: 'Size' },
  { key: 'type', label: 'Type' },
  { key: 'updated_at', label: 'Modified At' },
];

export default function FileManagerPage() {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const fileService = new FileService();

  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      try {
        const fetchedFiles = await fileService.fetchFiles();
        setFiles(fetchedFiles);
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
      await Promise.all(ids.map((id) => fileService.deleteFile(id)));
      setFiles(files.filter((file) => !ids.includes(file.id)));
    } catch (error) {
      console.error('Error deleting files:', error);
    }
  };

  return (
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
            searchableColumns: ['file_name', 'size', 'type', 'updated_at'],
          }}
        />
      </Card>
    </div>
  );
}