// components/chat-scope/tabs/SettingsTab.tsx

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChatScope } from '@/types/chat';

interface SettingsTabProps {
  settings: ChatScope['settings'];
  onSettingsChange: (newSettings: Partial<ChatScope['settings']>) => void;
}

export function SettingsTab({ settings, onSettingsChange }: SettingsTabProps) {
  const handleChange = (field: keyof ChatScope['settings'], value: string | boolean) => {
    onSettingsChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Chat Name */}
      <div className="space-y-2">
        <Label htmlFor="chatName">Chat Name</Label>
        <Input
          id="chatName"
          placeholder="Enter chat name"
          value={settings.chatName}
          onChange={(e) => handleChange('chatName', e.target.value)}
        />
      </div>

      {/* Bot Name */}
      <div className="space-y-2">
        <Label htmlFor="botName">Bot Name</Label>
        <Input
          id="botName"
          placeholder="Enter bot name"
          value={settings.botName}
          onChange={(e) => handleChange('botName', e.target.value)}
        />
      </div>

      {/* LLM Switcher */}
      <div className="space-y-2">
        <Label htmlFor="llmModel">Language Model</Label>
        <Select
          value={settings.llmModel}
          onValueChange={(value) => handleChange('llmModel', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a language model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="claude-v1">Claude v1</SelectItem>
            <SelectItem value="claude-instant-v1">Claude Instant v1</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Text to Speech */}
      <div className="flex items-center justify-between">
        <Label htmlFor="tts">Text to Speech</Label>
        <Switch 
          id="tts"
          checked={settings.textToSpeech}
          onCheckedChange={(checked) => handleChange('textToSpeech', checked)}
        />
      </div>

      {/* Speech to Text */}
      <div className="flex items-center justify-between">
        <Label htmlFor="stt">Speech to Text</Label>
        <Switch 
          id="stt"
          checked={settings.speechToText}
          onCheckedChange={(checked) => handleChange('speechToText', checked)}
        />
      </div>
    </div>
  );
}