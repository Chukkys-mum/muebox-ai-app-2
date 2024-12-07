// components/chat-scope/ChatScopePanel.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Plus, Upload, X } from 'lucide-react';

interface ChatScopePanelProps {
  isOpen: boolean;
  onClose: () => void;
  chatScope: typeof chatScopeState;
  onChatScopeChange: (newScope: Partial<typeof chatScopeState>) => void;
}

export function ChatScopePanel({ isOpen, onClose, chatScope, onChatScopeChange }: ChatScopePanelProps) {

// Framing Tab Component
function FramingTab() {
  return (
    <div className="space-y-6">
      {/* Personality Selection */}
      <div className="space-y-2">
        <Label>Personality</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select a personality profile" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex gap-2 pt-2">
          <Badge variant="secondary">Professional</Badge>
        </div>
      </div>

      {/* Template Selection */}
      <div className="space-y-2">
        <Label>Template</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="meeting">Meeting Notes</SelectItem>
              <SelectItem value="analysis">Data Analysis</SelectItem>
              <SelectItem value="creative">Creative Writing</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex gap-2 pt-2">
          <Badge variant="secondary">Meeting Notes</Badge>
        </div>
      </div>

      {/* Context & History */}
      <div className="space-y-2">
        <Label>Context & History</Label>
        <Textarea 
          placeholder="Provide background information and relevant history..."
          className="min-h-[100px]"
        />
      </div>

      {/* Goals */}
      <div className="space-y-2">
        <Label>Goals</Label>
        <Textarea 
          placeholder="What are the main objectives..."
          className="min-h-[80px]"
        />
      </div>

      {/* Task */}
      <div className="space-y-2">
        <Label>Task</Label>
        <Textarea 
          placeholder="What should be done..."
          className="min-h-[80px]"
        />
      </div>

      {/* Approach */}
      <div className="space-y-2">
        <Label>Approach</Label>
        <Textarea 
          placeholder="How should it be done..."
          className="min-h-[80px]"
        />
      </div>

      {/* Format */}
      <div className="space-y-2">
        <Label>Format</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select output format" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="list">List</SelectItem>
              <SelectItem value="table">Table</SelectItem>
              <SelectItem value="code">Code</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="essay">Essay</SelectItem>
              <SelectItem value="paragraph">Paragraph</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Length */}
      <div className="space-y-4">
        <Label>Length (words)</Label>
        <div className="px-2">
          <Slider
            defaultValue={[500]}
            max={2000}
            min={100}
            step={100}
            className="w-full"
          />
        </div>
        <div className="text-sm text-zinc-500">
          Target: 500 words
        </div>
      </div>
    </div>
  );
}

// Sources Tab Component
function SourcesTab() {
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

// Settings Tab Component
function SettingsTab() {
  return (
    <div className="space-y-6">
      {/* Chat Name */}
      <div className="space-y-2">
        <Label htmlFor="chatName">Chat Name</Label>
        <Input
          id="chatName"
          placeholder="Enter chat name"
        />
      </div>

      {/* Bot Name */}
      <div className="space-y-2">
        <Label htmlFor="botName">Bot Name</Label>
        <Input
          id="botName"
          placeholder="Enter bot name"
        />
      </div>

      {/* Text to Speech */}
      <div className="flex items-center justify-between">
        <Label htmlFor="tts">Text to Speech</Label>
        <Switch id="tts" />
      </div>

      {/* Speech to Text */}
      <div className="flex items-center justify-between">
        <Label htmlFor="stt">Speech to Text</Label>
        <Switch id="stt" />
      </div>
    </div>
  );
}

// Main Chat Scope Panel Component
export function ChatScopePanel({ isOpen, onClose }: ChatScopePanelProps) {
  return (
    <>
      {/* Panel */}
      <div 
        className={`fixed right-0 top-0 z-40 h-full w-[400px] transform bg-[#F8F8F8] shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
            <h2 className="text-xl font-bold">Chat Scope</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <Tabs defaultValue="framing" className="h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="framing">Framing</TabsTrigger>
                <TabsTrigger value="sources">Sources</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="framing" className="mt-4">
                <FramingTab />
              </TabsContent>
              <TabsContent value="sources" className="mt-4">
                <SourcesTab />
              </TabsContent>
              <TabsContent value="settings" className="mt-4">
                <SettingsTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Toggle Button */}
      <div 
        className={`fixed top-1/3 -translate-y-1/2 transform transition-all duration-300 ${
          isOpen ? 'right-[400px]' : 'right-0'
        } z-50`}
      >
        <Button
          onClick={() => onClose()}
          className="h-32 w-8 rounded-r-none rounded-l-md bg-[#F8F8F8] px-0 text-black hover:bg-[#F0F0F0]"
          style={{ 
            writingMode: 'vertical-rl',
            textOrientation: 'mixed'
          }}
        >
          Chat Context
        </Button>
      </div>
    </>
  );
}
}