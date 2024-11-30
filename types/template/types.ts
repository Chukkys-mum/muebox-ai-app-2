// /types/template/types.ts
// - types.ts (template type definitions)

import { JSONSchema7 } from 'json-schema';
import { LLMPreferences } from '../llm/scope';
import { LLMModelParams } from '../llm/config';

export type TemplateCategory = 
  | 'chat'
  | 'essay'
  | 'analysis'
  | 'code'
  | 'creative'
  | 'custom';

export type OutputFormat = {
  type: 'text' | 'json' | 'markdown' | 'html' | 'code';
  schema?: JSONSchema7;
  formatting?: {
    structure?: string;
    style?: string;
    parser?: string;
  };
};

export type PreprocessingRule = {
  id: string;
  type: 'transform' | 'validate' | 'enrich';
  condition?: string;
  action: string;
  order: number;
};

export type PostprocessingRule = {
  id: string;
  type: 'format' | 'filter' | 'transform';
  condition?: string;
  action: string;
  order: number;
};

export type ValidationRule = {
  id: string;
  field: string;
  type: 'required' | 'format' | 'range' | 'custom';
  condition: string;
  message: string;
};

export interface Template {
  id: string;
  version: string;
  name: string;
  description: string;
  category: TemplateCategory;
  metadata: {
    author: string;
    created: Date;
    modified: Date;
    tags: string[];
    isPublic: boolean;
    usageCount: number;
  };
  configuration: {
    inputSchema: JSONSchema7;
    outputFormat: OutputFormat;
    llmPreferences: LLMPreferences;
    defaultParams: LLMModelParams;
  };
  prompts: {
    main: string;
    followUp?: string[];
    fallback?: string[];
    variables?: string[];
  };
  preprocessing?: PreprocessingRule[];
  postprocessing?: PostprocessingRule[];
  validation: ValidationRule[];
}

export interface TemplateUsage {
  id: string;
  templateId: string;
  userId: string;
  timestamp: Date;
  inputs: Record<string, any>;
  result: {
    success: boolean;
    output?: any;
    error?: string;
  };
  metrics: {
    processingTime: number;
    tokensUsed: number;
    cost: number;
  };
}

export interface TemplateVersion {
  templateId: string;
  version: string;
  changes: string[];
  createdAt: Date;
  createdBy: string;
  template: Template;
}

export type TemplateSearchParams = {
  category?: TemplateCategory;
  tags?: string[];
  author?: string;
  isPublic?: boolean;
  query?: string;
};

export interface TemplateManagerInterface {
  createTemplate(template: Omit<Template, 'id'>): Promise<Template>;
  getTemplate(id: string, version?: string): Promise<Template | null>;
  updateTemplate(id: string, updates: Partial<Template>): Promise<Template>;
  deleteTemplate(id: string): Promise<boolean>;
  listTemplates(params?: TemplateSearchParams): Promise<Template[]>;
  validateTemplate(template: Template): Promise<boolean>;
  exportTemplate(id: string): Promise<string>;
  importTemplate(data: string): Promise<Template>;
  getTemplateUsage(id: string): Promise<TemplateUsage[]>;
}