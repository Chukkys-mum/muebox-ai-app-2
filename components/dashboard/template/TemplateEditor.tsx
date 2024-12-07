// - TemplateEditor.tsx (template creation/editing UI)

/// /components/template/TemplateEditor.tsx
'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Template } from '@/types/template/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { templateManager } from '@/services/template/TemplateManager';

interface TemplateEditorProps {
  initialTemplate?: Partial<Template>;
  onSave?: (template: Template) => void;
  onCancel?: () => void;
}

const getDefaultTemplate = (): Partial<Template> => ({
  name: '',
  description: '',
  category: 'custom',
  version: '1.0.0',
  metadata: {
    author: '',
    created: new Date(),
    modified: new Date(),
    tags: [],
    isPublic: false,
    usageCount: 0
  },
  configuration: {
    inputSchema: {
      type: 'object',
      properties: {}
    },
    outputFormat: {
      type: 'text'
    },
    llmPreferences: {
      preferred: [],
      excluded: []
    },
    defaultParams: {
      temperature: 0.7,
      topP: 1,
      maxTokens: 1000
    }
  },
  prompts: {
    main: '',
    variables: []
  },
  validation: []
});

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  initialTemplate,
  onSave,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<Template>({
    defaultValues: initialTemplate || getDefaultTemplate(),
  });

  const onSubmit = async (data: Template) => {
    setIsSaving(true);
    try {
      const updatedTemplate = {
        ...data,
        metadata: {
          ...data.metadata,
          modified: new Date()
        }
      };

      const isValid = await templateManager.validateTemplate(updatedTemplate);
      
      if (!isValid) {
        toast({
          title: 'Validation Error',
          description: 'The template is not valid. Please check your inputs.',
          variant: 'destructive'
        });
        return;
      }

      let savedTemplate: Template;
      if (initialTemplate?.id) {
        savedTemplate = await templateManager.updateTemplate(initialTemplate.id, updatedTemplate);
      } else {
        savedTemplate = await templateManager.createTemplate(updatedTemplate);
      }

      toast({
        title: 'Success',
        description: 'Template saved successfully'
      });

      if (onSave) {
        onSave(savedTemplate);
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>
            {initialTemplate?.id ? 'Edit Template' : 'Create Template'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="prompts">Prompts</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Name is required' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter template name"
                      />
                    )}
                  />
                  {errors.name && <span className="text-red-500">{errors.name.message}</span>}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        placeholder="Describe your template"
                        rows={3}
                      />
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chat">Chat</SelectItem>
                          <SelectItem value="essay">Essay</SelectItem>
                          <SelectItem value="analysis">Analysis</SelectItem>
                          <SelectItem value="code">Code</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="version">Version</Label>
                  <Controller
                    name="version"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="1.0.0"
                      />
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Controller
                    name="metadata.tags"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={field.value?.join(', ')}
                        onChange={(e) => field.onChange(e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                        placeholder="Enter tags"
                      />
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="author">Author</Label>
                  <Controller
                    name="metadata.author"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter author name"
                      />
                    )}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Controller
                    name="metadata.isPublic"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="isPublic">Make template public</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prompts">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mainPrompt">Main Prompt</Label>
                  <Controller
                    name="prompts.main"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        placeholder="Enter the main prompt template"
                        rows={6}
                      />
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="variables">Variables</Label>
                  <Controller
                    name="prompts.variables"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={field.value?.join(', ')}
                        onChange={(e) => field.onChange(e.target.value.split(',').map(v => v.trim()).filter(Boolean))}
                        placeholder="Enter variable names (comma-separated)"
                      />
                    )}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="config">
              <div className="space-y-4">
                <div>
                  <Label>Temperature</Label>
                  <Controller
                    name="configuration.defaultParams.temperature"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={0}
                        max={1}
                        step={0.1}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    )}
                  />
                </div>

                <div>
                  <Label>Max Tokens</Label>
                  <Controller
                    name="configuration.defaultParams.maxTokens"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    )}
                  />
                </div>

                <div>
                  <Label>Output Format</Label>
                  <Controller
                    name="configuration.outputFormat.type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select output format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="markdown">Markdown</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                          <SelectItem value="code">Code</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rules">
              <div className="space-y-4">
                <p>Validation rules implementation goes here.</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
