// components/chat-scope/tabs/SourcesTab.tsx

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Upload, X } from 'lucide-react';
import { ChatScope } from '@/types/chat';
import { FileRow } from '@/types';
import { KnowledgeBase } from '@/types/knowledgeBase';
import { EmailAccount } from '@/types/email';

interface SourcesTabProps {
  sources: ChatScope['sources'];
  onSourcesChange: (newSources: Partial<ChatScope['sources']>) => void;
  availableKnowledgeBases: KnowledgeBase[];
  availableEmailAccounts: EmailAccount[];
}

export function SourcesTab({ 
  sources, 
  onSourcesChange, 
  availableKnowledgeBases, 
  availableEmailAccounts 
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Here you would typically handle the file upload process
      // For now, we'll just add the file names to the sources
      const newFiles = Array.from(files).map(file => file.name);
      onSourcesChange({ files: [...sources.files, ...newFiles] });
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="space-y-2">
        <Label>Files</Label>
        <div className="flex h-32 w-full items-center justify-center rounded-md border border-dashed border-zinc-300">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center space-y-2">
              <Upload className="h-8 w-8 text-zinc-400" />
              <div className="text-sm text-zinc-600">
                Drag and drop files or click to upload
              </div>
            </div>
          </label>
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

      {/* Knowledge Base */}
      <div className="space-y-2">
        <Label>Knowledge Bases</Label>
        <select
          className="w-full rounded-md border border-zinc-300 p-2"
          value={sources.knowledgeBases[0] || ''}
          onChange={(e) => onSourcesChange({ knowledgeBases: [e.target.value] })}
        >
          <option value="">Select a Knowledge Base</option>
          {availableKnowledgeBases.map((kb) => (
            <option key={kb.id} value={kb.id}>{kb.name}</option>
          ))}
        </select>
      </div>

      {/* Emails */}
      <div className="space-y-2">
        <Label>Email Integration</Label>
        <select
          className="w-full rounded-md border border-zinc-300 p-2"
          value={sources.emails[0] || ''}
          onChange={(e) => onSourcesChange({ emails: [e.target.value] })}
        >
          <option value="">Select an Email Account</option>
          {availableEmailAccounts.map((account) => (
            <option key={account.id} value={account.id}>{account.email_address}</option>
          ))}
        </select>
      </div>
    </div>
  );
}