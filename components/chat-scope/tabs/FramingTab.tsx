// components/chat-scope/tabs/FramingTab.tsx

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { usePersonality } from '@/components/personality/PersonalityProvider';
import { PersonalityDrawer } from '@/components/personality/PersonalityDrawer';
import {
  ChatScope,
  TemplateValue,
  ContextValue,
  GoalsValue,
  TaskValue,
  ApproachValue,
  FormatValue,
  LengthValue,
  JsonB
} from '@/types';
import { Input } from '@/components/ui/input';
import { AccountStatus } from '@/types/subscription';

interface FramingTabProps {
  chatScope: ChatScope;
  onChatScopeChange: (newScope: Partial<ChatScope>) => void;
  accountStatus: AccountStatus;
}

interface FramingState {
  template: TemplateValue;
  context: ContextValue;
  goals: GoalsValue;
  task: TaskValue;
  approach: ApproachValue;
  format: FormatValue;
  length: LengthValue | undefined;
}

export function FramingTab({ chatScope, onChatScopeChange, accountStatus }: FramingTabProps) {
  const { selectedPreset, presets } = usePersonality();
  const [isPersonalityDrawerOpen, setIsPersonalityDrawerOpen] = useState(false);
  
  const jsonToString = (json: ContextValue | undefined): string => {
    if (typeof json === 'string') return json;
    if (json === null || json === undefined) return '';
    return JSON.stringify(json);
  };

  const [framing, setFraming] = useState<FramingState>({
    template: chatScope.template ?? '',
    context: jsonToString(chatScope.context),
    goals: chatScope.goals ?? '',
    task: chatScope.task ?? '',
    approach: chatScope.approach ?? '',
    format: chatScope.format ?? '',
    length: chatScope.length
  });

  const handleChange = (field: keyof FramingState, value: string | number | undefined) => {
    if (field === 'context') {
      const contextValue: ContextValue = value as string;
      setFraming(prev => ({ ...prev, context: contextValue }));
      handleContextChange(contextValue);
    } else if (field === 'length') {
      setFraming(prev => ({ ...prev, [field]: value as LengthValue | undefined }));
      onChatScopeChange({ [field]: value as LengthValue | undefined });
    } else {
      setFraming(prev => ({ ...prev, [field]: value as string }));
      onChatScopeChange({ [field]: value as string });
    }
  };
  
const handleContextChange = (value: ContextValue) => {
  if (typeof value === 'string') {
    try {
      const jsonValue = JSON.parse(value) as JsonB;
      onChatScopeChange({ context: jsonValue });
    } catch {
      onChatScopeChange({ context: value });
    }
  } else {
    onChatScopeChange({ context: value });
  }
};

const getMaxWordLimit = (status: AccountStatus) => {
  switch (status) {
    case 'trial':
    case 'subscriber':
      return Infinity;
    case 'regular':
      return 1000;
    default:
      return 1000;
  }
};

// In the component:
const maxWordLimit = getMaxWordLimit(accountStatus);

// When handling length change:
const handleLengthChange = (value: number | undefined) => {
  if (value === undefined || value <= maxWordLimit) {
    handleChange('length', value);
  } else {
    // Optionally, show an error message or toast notification
    console.warn(`Word limit exceeded. Maximum allowed: ${maxWordLimit}`);
  }
};

  useEffect(() => {
    setFraming({
      template: chatScope.template || '',
      context: jsonToString(chatScope.context),
      goals: chatScope.goals || '',
      task: chatScope.task || '',
      approach: chatScope.approach || '',
      format: chatScope.format || '',
      length: chatScope.length || 500
    });
  }, [chatScope]);

  // Templates data
  const templates = [
    { id: 'meeting', name: 'Meeting Notes', description: 'Structure and summarize meeting discussions' },
    { id: 'analysis', name: 'Data Analysis', description: 'Analyze and interpret data sets' },
    { id: 'research', name: 'Research Summary', description: 'Summarize research findings' },
    { id: 'creative', name: 'Creative Writing', description: 'Generate creative content' },
    { id: 'technical', name: 'Technical Documentation', description: 'Create technical documentation' }
  ];

  // Format options
  const formatOptions = [
    { id: 'list', name: 'Bullet List' },
    { id: 'table', name: 'Table' },
    { id: 'code', name: 'Code' },
    { id: 'blog', name: 'Blog Post' },
    { id: 'essay', name: 'Essay' },
    { id: 'paragraph', name: 'Paragraphs' }
  ];


  return (
    <div className="space-y-6">
      {/* Personality Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Personality</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPersonalityDrawerOpen(true)}
            className="h-8 w-8 p-0"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          {selectedPreset ? (
            <Badge variant="secondary">
              {presets[selectedPreset].name}
            </Badge>
          ) : (
            <Badge variant="outline">Custom</Badge>
          )}
        </div>
      </div>

      {/* Template Selection */}
      <div className="space-y-2">
        <Label>Template</Label>
        <Select
          value={framing.template}
          onValueChange={(value) => handleChange('template', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {templates.map(template => (
                <SelectItem 
                  key={template.id} 
                  value={template.id}
                >
                  {template.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {framing.template && (
          <div className="flex gap-2 pt-2">
            <Badge variant="secondary">
              {templates.find(t => t.id === framing.template)?.name}
            </Badge>
          </div>
        )}
      </div>

      {/* Context & History */}
      <div className="space-y-2">
        <Label>Context & History</Label>
        <Textarea 
          placeholder="Provide background information and relevant history..."
          className="min-h-[100px] resize-y"
          value={typeof framing.context === 'string' ? framing.context : JSON.stringify(framing.context)}
          onChange={(e) => handleChange('context', e.target.value)}
        />
      </div>

      {/* Goals */}
      <div className="space-y-2">
        <Label>Goals</Label>
        <Textarea 
          placeholder="What are the main objectives..."
          className="min-h-[80px] resize-y"
          value={framing.goals}
          onChange={(e) => handleChange('goals', e.target.value)}
        />
      </div>

      {/* Task */}
      <div className="space-y-2">
        <Label>Task</Label>
        <Textarea 
          placeholder="What should be done..."
          className="min-h-[80px] resize-y"
          value={framing.task}
          onChange={(e) => handleChange('task', e.target.value)}
        />
      </div>

      {/* Approach */}
      <div className="space-y-2">
        <Label>Approach</Label>
        <Textarea 
          placeholder="How should it be done (e.g., ask questions, provide feedback, step-by-step)..."
          className="min-h-[80px] resize-y"
          value={framing.approach}
          onChange={(e) => handleChange('approach', e.target.value)}
        />
      </div>

      {/* Format */}
      <div className="space-y-2">
        <Label>Format</Label>
        <Select
          value={framing.format}
          onValueChange={(value) => handleChange('format', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select output format" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {formatOptions.map(format => (
                <SelectItem 
                  key={format.id} 
                  value={format.id}
                >
                  {format.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {framing.format && (
          <div className="flex gap-2 pt-2">
            <Badge variant="secondary">
              {formatOptions.find(f => f.id === framing.format)?.name}
            </Badge>
          </div>
        )}
      </div>

      {/* Length */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Length (words)</Label>
          <span className="text-sm text-muted-foreground">
            Target: {framing.length} words
          </span>
        </div>
        <Input
          type="number"
          placeholder="Enter word limit (optional)"
          value={framing.length || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            handleLengthChange(e.target.value ? parseInt(e.target.value, 10) : undefined)
          }
        />
        {accountStatus === 'regular' && (
          <p className="text-sm text-muted-foreground">
            Maximum word limit: 1000 words
          </p>
        )}
      </div>

      {/* Personality Drawer */}
      <PersonalityDrawer
        isOpen={isPersonalityDrawerOpen}
        onClose={() => setIsPersonalityDrawerOpen(false)}
      />
    </div>
  );
}