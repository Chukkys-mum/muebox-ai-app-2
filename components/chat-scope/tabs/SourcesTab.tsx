// components/chat-scope/tabs/SourcesTab.tsx

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Upload, X } from 'lucide-react';

export function SourcesTab() {
  const [urls, setUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');

  const addUrl = () => {
    if (newUrl && !urls.includes(newUrl)) {
      setUrls([...urls, newUrl]);
      setNewUrl('');
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="space-y-2">
        <Label>Files</Label>
        <div className="flex h-32 w-full items-center justify-center rounded-md border border-dashed border-zinc-300">
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-8 w-8 text-zinc-400" />
            <div className="text-sm text-zinc-600">
              Drag and drop files or click to upload
            </div>
          </div>
        </div>
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
          {urls.map((url, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border border-zinc-200 bg-white p-2"
            >
              <span className="text-sm truncate">{url}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setUrls(urls.filter((_, i) => i !== index))}
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
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Connect Knowledge Base
        </Button>
      </div>

      {/* Emails */}
      <div className="space-y-2">
        <Label>Email Integration</Label>
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Connect Email Account
        </Button>
      </div>
    </div>
  );
}