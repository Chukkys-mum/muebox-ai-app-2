// components/chat-scope/tabs/SourcesTab.tsx

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Upload, X } from 'lucide-react';
import { ChatScope, KnowledgeBase, FileRow } from '@/types';
import { Combobox } from '@/components/ui/combobox';
import { Badge } from '@/components/ui/badge';
import { useDropzone } from 'react-dropzone';

interface SourcesTabProps {
  sources: ChatScope['sources'];
  onSourcesChange: (newSources: Partial<ChatScope['sources']>) => void;
  availableKnowledgeBases: KnowledgeBase[];
  availableFolders: FileRow[];
}

export function SourcesTab({ 
  sources, 
  onSourcesChange, 
  availableKnowledgeBases, 
  availableFolders 
}: SourcesTabProps) {
  const [newUrl, setNewUrl] = useState('');

  const addUrl = () => {
    if (newUrl && !sources.urls.includes(newUrl)) {
      onSourcesChange({ urls: [...sources.urls, newUrl] });
      setNewUrl('');
    }
  };

  const removeUrl = (urlToRemove: string) => {
    onSourcesChange({ urls: sources.urls.filter(url => url !== urlToRemove) });
  };

  const handleKnowledgeBaseSelect = (kbId: string) => {
    if (!sources.knowledgeBases.includes(kbId)) {
      onSourcesChange({ knowledgeBases: [...sources.knowledgeBases, kbId] });
    }
  };

  const handleKnowledgeBaseRemove = (kbId: string) => {
    onSourcesChange({ knowledgeBases: sources.knowledgeBases.filter(id => id !== kbId) });
  };

  const handleFolderSelect = (folderId: string) => {
    if (!sources.folders.includes(folderId)) {
      onSourcesChange({ folders: [...sources.folders, folderId] });
    }
  };

  const handleFolderRemove = (folderId: string) => {
    onSourcesChange({ folders: sources.folders.filter(id => id !== folderId) });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map(file => file.name);
      onSourcesChange({ files: [...sources.files, ...newFiles] });
    }
  });

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="space-y-2">
        <Label>Files</Label>
        <div 
          {...getRootProps()} 
          className={`flex h-32 w-full items-center justify-center rounded-md border border-dashed ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-zinc-300'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-8 w-8 text-zinc-400" />
            <div className="text-sm text-zinc-600">
              {isDragActive ? 'Drop the files here' : 'Drag and drop files or click to upload'}
            </div>
          </div>
        </div>
        {sources.files.length > 0 && (
          <div className="mt-2 space-y-2">
            {sources.files.map((file, index) => (
              <div key={index} className="flex items-center justify-between rounded-md border border-zinc-200 bg-white p-2">
                <span className="text-sm truncate">{file}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSourcesChange({ files: sources.files.filter((_, i) => i !== index) })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* URLs */}
      <div className="space-y-2">
        <Label>URLs</Label>
        <div className="flex space-x-2">
          <Input
            placeholder="Enter URL"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <Button 
            variant="outline" 
            size="icon"
            onClick={addUrl}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 space-y-2">
          {sources.urls.map((url, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border border-zinc-200 bg-white p-2"
            >
              <span className="text-sm truncate">{url}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeUrl(url)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge Bases */}
      <div className="space-y-2">
        <Label>Knowledge Bases</Label>
        <Combobox
          items={availableKnowledgeBases.map(kb => ({ id: kb.id, name: kb.name }))}
          value=""
          onChange={handleKnowledgeBaseSelect}
          placeholder="Select a Knowledge Base"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {sources.knowledgeBases.map((kbId) => {
            const kb = availableKnowledgeBases.find(k => k.id === kbId);
            return (
              <Badge key={kbId} variant="secondary">
                {kb?.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleKnowledgeBaseRemove(kbId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Folders */}
      <div className="space-y-2">
        <Label>Folders</Label>
        <Combobox
          items={availableFolders.map(folder => ({ id: folder.id, name: folder.file_name }))}
          value=""
          onChange={handleFolderSelect}
          placeholder="Select a Folder"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {sources.folders.map((folderId) => {
            const folder = availableFolders.find(f => f.id === folderId);
            return (
              <Badge key={folderId} variant="secondary">
                {folder?.file_name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFolderRemove(folderId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}