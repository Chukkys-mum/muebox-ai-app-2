// /types/template/types.ts

import { WithTimestamps, WithStatus } from '../common';
import { JSONSchema7 } from 'json-schema';
import { LLMPreferences } from '../llm/scope';
import { LLMModelParams } from '../llm/config';
import { Json } from '../types_db';

// Core types
export type TemplateCategory = 'chat' | 'essay' | 'analysis' | 'code' | 'creative' | 'custom';
export type TemplateStatus = 'active' | 'archived' | 'deleted' | 'draft';

export type OutputFormat = {
  type: 'text' | 'json' | 'markdown' | 'html' | 'code';
  schema?: JSONSchema7;
  formatting?: {
    structure?: string;
    style?: string;
    parser?: string;
  };
};

// Domain Models with proper type inheritance
export interface Template extends WithTimestamps, WithStatus {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  version: string;
  user_id: string;
  archived: boolean;
  
  // Complex objects (stored as JSON in DB)
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
  
  validation: ValidationRule[];
}

// Database Compatible Models
export interface DbTemplate {
  id: string;
  name: string;
  description: string;
  category: string; // Note: string type to match DB
  version: string;
  user_id: string;
  metadata: Json;
  configuration: Json;
  prompts: Json;
  validation: Json;
  created_at: string;
  updated_at: string;
  archived: boolean;
}

// Template Usage matching DB schema
export interface TemplateUsage {
  id: string;
  template_id: string;
  user_id: string;
  timestamp: string;
  inputs: Json;
  result: Json;
  metrics: Json;
}

// Template Versions matching DB schema
export interface TemplateVersion {
  id: string;
  template_id: string;
  version: string;
  changes: Json;
  template_data: Json;
  created_at: string;
  created_by: string;
}

// Rest of your types...
export type ValidationRule = {
  id: string;
  field: string;
  type: 'required' | 'format' | 'range' | 'custom';
  condition: string;
  message: string;
};

// Type safe conversion functions
function serializeToJson<T>(obj: T): Json {
  return JSON.parse(JSON.stringify(obj)) as Json;
}

// Type Conversion Utilities with proper typing
export function domainToDb(template: Template): DbTemplate {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    version: template.version,
    user_id: template.user_id,
    // Use serializeToJson for complex objects
    metadata: serializeToJson({
      author: template.metadata.author,
      created: template.metadata.created.toISOString(),
      modified: template.metadata.modified.toISOString(),
      tags: template.metadata.tags,
      isPublic: template.metadata.isPublic,
      usageCount: template.metadata.usageCount
    }),
    configuration: serializeToJson({
      inputSchema: template.configuration.inputSchema,
      outputFormat: template.configuration.outputFormat,
      llmPreferences: template.configuration.llmPreferences,
      defaultParams: template.configuration.defaultParams
    }),
    prompts: serializeToJson({
      main: template.prompts.main,
      followUp: template.prompts.followUp,
      fallback: template.prompts.fallback,
      variables: template.prompts.variables
    }),
    validation: serializeToJson(template.validation),
    created_at: template.created_at,
    updated_at: template.updated_at,
    archived: template.archived
  };
}

export function dbToDomain(dbTemplate: DbTemplate): Template {
  // Parse JSON strings back to objects
  const metadata = typeof dbTemplate.metadata === 'string' 
    ? JSON.parse(dbTemplate.metadata) 
    : dbTemplate.metadata;
  const configuration = typeof dbTemplate.configuration === 'string'
    ? JSON.parse(dbTemplate.configuration)
    : dbTemplate.configuration;
  const prompts = typeof dbTemplate.prompts === 'string'
    ? JSON.parse(dbTemplate.prompts)
    : dbTemplate.prompts;
  const validation = typeof dbTemplate.validation === 'string'
    ? JSON.parse(dbTemplate.validation)
    : dbTemplate.validation;

  return {
    ...dbTemplate,
    status: 'active',
    category: dbTemplate.category as TemplateCategory,
    metadata: {
      author: metadata.author,
      created: new Date(metadata.created),
      modified: new Date(metadata.modified),
      tags: metadata.tags,
      isPublic: metadata.isPublic,
      usageCount: metadata.usageCount
    },
    configuration: {
      inputSchema: configuration.inputSchema,
      outputFormat: configuration.outputFormat,
      llmPreferences: configuration.llmPreferences,
      defaultParams: configuration.defaultParams
    },
    prompts: {
      main: prompts.main,
      followUp: prompts.followUp,
      fallback: prompts.fallback,
      variables: prompts.variables
    },
    validation: validation
  };
}

export interface DbTemplateUsage {
  id: string;
  template_id: string;
  user_id: string;
  timestamp: string;
  inputs: Json;
  result: Json;
  metrics: Json;
}

export interface DbTemplateVersion {
  id: string;
  template_id: string;
  version: string;
  changes: Json;
  template_data: Json;
  created_at: string;
  created_by: string;
}
