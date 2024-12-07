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
import { LLM, LLMConfiguration } from '@/types/llm';

interface SettingsTabProps {
  settings: ChatScope['settings'];
  onSettingsChange: (newSettings: Partial<ChatScope['settings']>) => void;
  availableLLMs: LLM[];
  llmConfigurations: LLMConfiguration[];
}

export function SettingsTab({ settings, onSettingsChange, availableLLMs, llmConfigurations }: SettingsTabProps) {
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
        <Label htmlFor="llmId">Language Model</Label>
        <Select
          value={settings.llmId}
          onValueChange={(value) => handleChange('llmId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a language model" />
          </SelectTrigger>
          <SelectContent>
            {availableLLMs.map((llm) => (
              <SelectItem key={llm.id} value={llm.id}>
                {llm.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* LLM Configuration */}
      {settings.llmId && (
        <div className="space-y-2">
          <Label>LLM Configuration</Label>
          {llmConfigurations
            .filter(config => config.id === settings.llmId)
            .map(config => (
              <div key={config.id} className="text-sm">
                <p>Provider: {config.provider}</p>
                <p>Max Tokens: {config.max_tokens}</p>
                <p>Capabilities: {config.capabilities.join(', ')}</p>
              </div>
            ))
          }
        </div>
      )}

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