// - config.ts (template configuration types)

import { JSONSchema7 } from 'json-schema';
import { OutputFormat } from './types';
import { LLMPreferences } from '../llm/scope';
import { LLMModelParams } from '../llm/config';

export interface TemplateConfig {
    inputSchema: JSONSchema7;
    outputFormat: OutputFormat;
    llmPreferences: LLMPreferences;
    defaultParams: LLMModelParams;
  }