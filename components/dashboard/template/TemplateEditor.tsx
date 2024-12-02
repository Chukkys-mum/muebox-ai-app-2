// - TemplateEditor.tsx (template creation/editing UI)

// /components/template/TemplateEditor.tsx
import React, { useState, useEffect } from 'react';
import { Template, TemplateCategory } from '@/types/template/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { templateValidator } from '@/services/template/TemplateValidator';
import { templateManager } from '@/services/template/TemplateManager';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

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
    author: '',  // Will need to be set from user context
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
  const [template, setTemplate] = useState<Partial<Template>>(() => {
  const defaultTemplate = getDefaultTemplate();
  return initialTemplate ? { ...defaultTemplate, ...initialTemplate } : defaultTemplate;
});

  const [activeTab, setActiveTab] = useState('basic');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (
    field: string,
    value: any,
    section?: keyof Template,
    subsection?: string
  ) => {
    setTemplate(prev => {
      if (section) {
        if (subsection) {
          const sectionData = prev[section] || {};
          const subsectionData = (sectionData as any)?.[subsection] || {};
          return {
            ...prev,
            [section]: {
              ...sectionData,
              [subsection]: {
                ...subsectionData,
                [field]: value
              }
            }
          };
        }
        const sectionData = prev[section] || {};
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [field]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
    handleInputChange('tags', tags, 'metadata');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update modified date before saving
      const updatedTemplate = {
        ...template,
        metadata: {
          ...template.metadata,
          modified: new Date()
        }
      };

      // Validate template
      const validation = await templateValidator.validateTemplate(updatedTemplate as Template);
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        toast({
          title: 'Validation Error',
          description: 'Please fix the errors before saving',
          variant: 'destructive'
        });
        return;
      }

      // Save template
      const savedTemplate = initialTemplate?.id
        ? await templateManager.updateTemplate(initialTemplate.id, updatedTemplate as Template)
        : await templateManager.createTemplate(updatedTemplate as Template);

      toast({
        title: 'Success',
        description: 'Template saved successfully'
      });

      onSave?.(savedTemplate);
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
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={template.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder="Enter template name"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={template.description}
                    onChange={e => handleInputChange('description', e.target.value)}
                    placeholder="Describe your template"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={template.category}
                    onValueChange={value => handleInputChange('category', value)}
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
                </div>

                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={template.version}
                    onChange={e => handleInputChange('version', e.target.value)}
                    placeholder="1.0.0"
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={template.metadata?.tags?.join(', ')}
                    onChange={e => handleTagsChange(e.target.value)}
                    placeholder="Enter tags"
                  />
                </div>

                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={template.metadata?.author}
                    onChange={e => handleInputChange('author', e.target.value, 'metadata')}
                    placeholder="Enter author name"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prompts">
            <div className="space-y-4">
              <div>
                <Label htmlFor="mainPrompt">Main Prompt</Label>
                <Textarea
                  id="mainPrompt"
                  value={template.prompts?.main}
                  onChange={e => handleInputChange('main', e.target.value, 'prompts')}
                  placeholder="Enter the main prompt template"
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="variables">Variables</Label>
                <Input
                  id="variables"
                  value={template.prompts?.variables?.join(', ')}
                  onChange={e => handleInputChange(
                    'variables',
                    e.target.value.split(',').map(v => v.trim()).filter(Boolean),
                    'prompts'
                  )}
                  placeholder="Enter variable names (comma-separated)"
                />
              </div>

              <div>
                <Label htmlFor="followUp">Follow-up Prompts</Label>
                <Textarea
                  id="followUp"
                  value={template.prompts?.followUp?.join('\n')}
                  onChange={e => handleInputChange(
                    'followUp',
                    e.target.value.split('\n').filter(Boolean),
                    'prompts'
                  )}
                  placeholder="Enter follow-up prompts (one per line)"
                  rows={4}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="config">
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label>Temperature</Label>
                  <Input
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                    value={template.configuration?.defaultParams?.temperature}
                    onChange={e => handleInputChange(
                      'temperature',
                      parseFloat(e.target.value),
                      'configuration',
                      'defaultParams'
                    )}
                  />
                </div>

                <div>
                  <Label>Max Tokens</Label>
                  <Input
                    type="number"
                    min={1}
                    value={template.configuration?.defaultParams?.maxTokens}
                    onChange={e => handleInputChange(
                      'maxTokens',
                      parseInt(e.target.value),
                      'configuration',
                      'defaultParams'
                    )}
                  />
                </div>

                <div>
                  <Label>Output Format</Label>
                  <Select
                    value={template.configuration?.outputFormat?.type}
                    onValueChange={value => handleInputChange(
                      'type',
                      value,
                      'configuration',
                      'outputFormat'
                    )}
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
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rules">
            {/* Validation Rules UI here */}
          </TabsContent>
        </Tabs>

        {validationErrors.length > 0 && (
          <Alert className="mt-4" variant="destructive">
            <AlertDescription>
              <ul className="list-disc pl-4">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-6 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};