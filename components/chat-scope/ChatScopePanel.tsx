// components/chat-scope/ChatScopePanel.tsx

import React from 'react';
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
import { X, HelpCircle } from 'lucide-react';
import { SourcesTab } from './tabs/SourcesTab';
import { ChatScope } from '@/types/chat';

interface ChatScopePanelProps {
  isOpen: boolean;
  onClose: () => void;
  chatScope: ChatScope;
  onChatScopeChange: (newScope: Partial<ChatScope>) => void;
  availableKnowledgeBases: any[];
  availableFolders: any[];
}

export function ChatScopePanel({
  isOpen,
  onClose,
  chatScope,
  onChatScopeChange,
  availableKnowledgeBases,
  availableFolders
}: ChatScopePanelProps) {
  
  // Framing Tab Component
  function FramingTab() {
    return (
      <div className="space-y-6">
        {/* Personality Selection */}
        <div className="space-y-2">
          <Label>Personality</Label>
          <Select
            value={chatScope.personality_profile_id || ''}
            onValueChange={(value) => onChatScopeChange({ personality_profile_id: value })}
          >
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
            <Badge variant="secondary">{chatScope.personality_profile_id}</Badge>
          </div>
        </div>

        {/* Template Selection */}
        <div className="space-y-2">
          <Label>Template</Label>
          <Select
            value={chatScope.template || ''}
            onValueChange={(value) => onChatScopeChange({ template: value })}
          >
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
            <Badge variant="secondary">{chatScope.template}</Badge>
          </div>
        </div>

        {/* Context & History */}
        <div className="space-y-2">
          <Label>Context & History</Label>
          <Textarea 
            value={typeof chatScope.context === 'string' ? chatScope.context : JSON.stringify(chatScope.context)}
            onChange={(e) => onChatScopeChange({ context: e.target.value })}
            placeholder="Provide background information and relevant history..."
            className="min-h-[100px]"
          />
        </div>

        {/* Goals */}
        <div className="space-y-2">
          <Label>Goals</Label>
          <Textarea 
            value={chatScope.goals || ''}
            onChange={(e) => onChatScopeChange({ goals: e.target.value })}
            placeholder="What are the main objectives..."
            className="min-h-[80px]"
          />
        </div>

        {/* Task */}
        <div className="space-y-2">
          <Label>Task</Label>
          <Textarea 
            value={chatScope.task || ''}
            onChange={(e) => onChatScopeChange({ task: e.target.value })}
            placeholder="What should be done..."
            className="min-h-[80px]"
          />
        </div>

        {/* Approach */}
        <div className="space-y-2">
          <Label>Approach</Label>
          <Textarea 
            value={chatScope.approach || ''}
            onChange={(e) => onChatScopeChange({ approach: e.target.value })}
            placeholder="How should it be done..."
            className="min-h-[80px]"
          />
        </div>

        {/* Format */}
        <div className="space-y-2">
          <Label>Format</Label>
          <Select
            value={chatScope.format || ''}
            onValueChange={(value) => onChatScopeChange({ format: value })}
          >
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
              value={[chatScope.length || 500]}
              onValueChange={(value) => onChatScopeChange({ length: value[0] })}
              max={2000}
              min={100}
              step={100}
              className="w-full"
            />
          </div>
          <div className="text-sm text-zinc-500">
            Target: {chatScope.length || 500} words
          </div>
        </div>
      </div>
    );
  }

  // Settings Tab Component
  // Settings Tab Component
  function SettingsTab() {
    return (
      <div className="space-y-6">
        {/* Chat Name */}
        <div className="space-y-2">
          <Label htmlFor="chatName">Chat Name</Label>
          <Input
            id="chatName"
            value={chatScope.settings?.chatName || ''}
            onChange={(e) => onChatScopeChange({
              settings: {
                ...chatScope.settings,
                chatName: e.target.value,
              }
            })}
            placeholder="Enter chat name"
          />
          <p className="text-sm text-gray-500">Chat name is automatically generated based on the conversation context.</p>
        </div>
  
        {/* Bot Name */}
        <div className="space-y-2">
          <Label htmlFor="botName">Bot Name</Label>
          <Input
            id="botName"
            value={chatScope.settings?.botName || 'Zach'}
            onChange={(e) => onChatScopeChange({
              settings: {
                ...chatScope.settings,
                botName: e.target.value,
              }
            })}
            placeholder="Enter bot name"
          />
        </div>
  
        {/* Text to Speech */}
        <div className="flex items-center justify-between">
          <Label htmlFor="tts">Text to Speech</Label>
          <Switch
            id="tts"
            checked={chatScope.settings?.textToSpeech || false}
            onCheckedChange={(checked) => onChatScopeChange({
              settings: {
                ...chatScope.settings,
                textToSpeech: checked,
              }
            })}
          />
        </div>
  
        {/* Speech to Text */}
        <div className="flex items-center justify-between">
          <Label htmlFor="stt">Speech to Text</Label>
          <Switch
            id="stt"
            checked={chatScope.settings?.speechToText || false}
            onCheckedChange={(checked) => onChatScopeChange({
              settings: {
                ...chatScope.settings,
                speechToText: checked,
              }
            })}
          />
        </div>
  
        {/* Choose LLMs */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="llmChoice">Choose LLMs</Label>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => {
                alert("Select and set your preferred Language Models for chat interactions.");
              }}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
          <Select
            value={chatScope.settings?.llmId || 'gpt-3.5-turbo'}
            onValueChange={(value) => onChatScopeChange({
              settings: {
                ...chatScope.settings,
                llmId: value,
              }
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select LLM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              {/* Add more LLM options as needed */}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  return (
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
              <SourcesTab
                sources={chatScope.sources}
                onSourcesChange={(newSources) => onChatScopeChange({ sources: newSources })}
                availableKnowledgeBases={availableKnowledgeBases}
                availableFolders={availableFolders}
              />
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}