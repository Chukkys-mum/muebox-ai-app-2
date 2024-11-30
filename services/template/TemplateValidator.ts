// - TemplateValidator.ts (template validation)

// /services/template/TemplateValidator.ts

import { 
    Template, 
    ValidationRule, 
    PreprocessingRule,
    PostprocessingRule,
    OutputFormat 
  } from '@/types/template/types';
  import { LLMModelParams } from '@/types/llm/config';
  import { llmManager } from '../llm/LLMManager';
  import { validate as validateJsonSchema } from 'json-schema';
  
  export class TemplateValidator {
    public async validateTemplate(template: Template): Promise<{
      isValid: boolean;
      errors: string[];
    }> {
      const errors: string[] = [];
  
      try {
        // Basic structure validation
        this.validateBasicStructure(template, errors);
  
        // Validate configuration
        await this.validateConfiguration(template, errors);
  
        // Validate prompts
        this.validatePrompts(template, errors);
  
        // Validate rules
        if (template.preprocessing) {
          this.validatePreprocessingRules(template.preprocessing, errors);
        }
        if (template.postprocessing) {
          this.validatePostprocessingRules(template.postprocessing, errors);
        }
        this.validateValidationRules(template.validation, errors);
  
        // Validate LLM compatibility
        await this.validateLLMCompatibility(template, errors);
  
        return {
          isValid: errors.length === 0,
          errors
        };
      } catch (error) {
        console.error('Template validation failed:', error);
        errors.push('Unexpected validation error occurred');
        return {
          isValid: false,
          errors
        };
      }
    }
  
    private validateBasicStructure(template: Template, errors: string[]): void {
      // Required fields
      if (!template.name?.trim()) {
        errors.push('Template name is required');
      }
      if (!template.category) {
        errors.push('Template category is required');
      }
      if (!template.version?.match(/^\d+\.\d+\.\d+$/)) {
        errors.push('Invalid version format. Use semantic versioning (e.g., 1.0.0)');
      }
  
      // Metadata validation
      if (!template.metadata.author?.trim()) {
        errors.push('Template author is required');
      }
      if (!Array.isArray(template.metadata.tags)) {
        errors.push('Tags must be an array');
      }
    }
  
    private async validateConfiguration(template: Template, errors: string[]): Promise<void> {
      const { configuration } = template;
  
      // Validate input schema
      if (!configuration.inputSchema) {
        errors.push('Input schema is required');
      } else {
        try {
          const schemaValidation = validateJsonSchema({}, configuration.inputSchema);
          if (!schemaValidation) {
            errors.push('Invalid input schema format');
          }
        } catch (error) {
          errors.push('Error validating input schema: ' + error.message);
        }
      }
  
      // Validate output format
      this.validateOutputFormat(configuration.outputFormat, errors);
  
      // Validate LLM preferences
      if (configuration.llmPreferences) {
        const { preferred, excluded } = configuration.llmPreferences;
        
        if (preferred) {
          for (const llmId of preferred) {
            const llm = llmManager.getLLMById(llmId);
            if (!llm) {
              errors.push(`Preferred LLM "${llmId}" not found`);
            }
          }
        }
  
        if (excluded) {
          for (const llmId of excluded) {
            const llm = llmManager.getLLMById(llmId);
            if (!llm) {
              errors.push(`Excluded LLM "${llmId}" not found`);
            }
          }
        }
  
        // Check for conflicts
        const commonLLMs = preferred?.filter(llm => excluded?.includes(llm)) || [];
        if (commonLLMs.length > 0) {
          errors.push(`LLMs cannot be both preferred and excluded: ${commonLLMs.join(', ')}`);
        }
      }
  
      // Validate default parameters
      this.validateModelParams(configuration.defaultParams, errors);
    }
  
    private validateOutputFormat(format: OutputFormat, errors: string[]): void {
      const validTypes = ['text', 'json', 'markdown', 'html', 'code'];
      if (!validTypes.includes(format.type)) {
        errors.push(`Invalid output format type. Must be one of: ${validTypes.join(', ')}`);
      }
  
      if (format.type === 'json' && !format.schema) {
        errors.push('JSON output format requires a schema');
      }
  
      if (format.schema) {
        try {
          const schemaValidation = validateJsonSchema({}, format.schema);
          if (!schemaValidation) {
            errors.push('Invalid output schema format');
          }
        } catch (error) {
          errors.push('Error validating output schema: ' + error.message);
        }
      }
    }
  
    private validateModelParams(params: LLMModelParams, errors: string[]): void {
      if (params.temperature < 0 || params.temperature > 1) {
        errors.push('Temperature must be between 0 and 1');
      }
      if (params.topP < 0 || params.topP > 1) {
        errors.push('Top P must be between 0 and 1');
      }
      if (params.maxTokens < 1) {
        errors.push('Max tokens must be greater than 0');
      }
      if (params.frequencyPenalty && (params.frequencyPenalty < -2 || params.frequencyPenalty > 2)) {
        errors.push('Frequency penalty must be between -2 and 2');
      }
      if (params.presencePenalty && (params.presencePenalty < -2 || params.presencePenalty > 2)) {
        errors.push('Presence penalty must be between -2 and 2');
      }
    }
  
    private validatePrompts(template: Template, errors: string[]): void {
      const { prompts, configuration } = template;
  
      // Validate main prompt
      if (!prompts.main?.trim()) {
        errors.push('Main prompt is required');
      }
  
      // Validate prompt variables
      if (prompts.variables) {
        const schemaProperties = Object.keys(configuration.inputSchema.properties || {});
        
        for (const variable of prompts.variables) {
          if (!schemaProperties.includes(variable)) {
            errors.push(`Variable "${variable}" not defined in input schema`);
          }
        }
  
        // Check for unused schema properties
        for (const property of schemaProperties) {
          if (!prompts.variables.includes(property)) {
            errors.push(`Schema property "${property}" not used in any prompt variables`);
          }
        }
      }
  
      // Validate follow-up prompts
      if (prompts.followUp) {
        if (!Array.isArray(prompts.followUp)) {
          errors.push('Follow-up prompts must be an array');
        } else {
          prompts.followUp.forEach((prompt, index) => {
            if (!prompt?.trim()) {
              errors.push(`Follow-up prompt at index ${index} is empty`);
            }
          });
        }
      }
  
      // Validate fallback prompts
      if (prompts.fallback) {
        if (!Array.isArray(prompts.fallback)) {
          errors.push('Fallback prompts must be an array');
        } else {
          prompts.fallback.forEach((prompt, index) => {
            if (!prompt?.trim()) {
              errors.push(`Fallback prompt at index ${index} is empty`);
            }
          });
        }
      }
    }
  
    private validatePreprocessingRules(rules: PreprocessingRule[], errors: string[]): void {
      const validTypes = ['transform', 'validate', 'enrich'];
      const seenOrders = new Set<number>();
  
      rules.forEach((rule, index) => {
        if (!rule.id) {
          errors.push(`Preprocessing rule at index ${index} missing ID`);
        }
        if (!validTypes.includes(rule.type)) {
          errors.push(`Invalid preprocessing rule type at index ${index}: ${rule.type}`);
        }
        if (!rule.action?.trim()) {
          errors.push(`Preprocessing rule at index ${index} missing action`);
        }
        if (seenOrders.has(rule.order)) {
          errors.push(`Duplicate preprocessing rule order: ${rule.order}`);
        }
        seenOrders.add(rule.order);
      });
    }
  
    private validatePostprocessingRules(rules: PostprocessingRule[], errors: string[]): void {
      const validTypes = ['format', 'filter', 'transform'];
      const seenOrders = new Set<number>();
  
      rules.forEach((rule, index) => {
        if (!rule.id) {
          errors.push(`Postprocessing rule at index ${index} missing ID`);
        }
        if (!validTypes.includes(rule.type)) {
          errors.push(`Invalid postprocessing rule type at index ${index}: ${rule.type}`);
        }
        if (!rule.action?.trim()) {
          errors.push(`Postprocessing rule at index ${index} missing action`);
        }
        if (seenOrders.has(rule.order)) {
          errors.push(`Duplicate postprocessing rule order: ${rule.order}`);
        }
        seenOrders.add(rule.order);
      });
    }
  
    private validateValidationRules(rules: ValidationRule[], errors: string[]): void {
      const validTypes = ['required', 'format', 'range', 'custom'];
  
      rules.forEach((rule, index) => {
        if (!rule.id) {
          errors.push(`Validation rule at index ${index} missing ID`);
        }
        if (!rule.field?.trim()) {
          errors.push(`Validation rule at index ${index} missing field`);
        }
        if (!validTypes.includes(rule.type)) {
          errors.push(`Invalid validation rule type at index ${index}: ${rule.type}`);
        }
        if (!rule.condition?.trim()) {
          errors.push(`Validation rule at index ${index} missing condition`);
        }
        if (!rule.message?.trim()) {
          errors.push(`Validation rule at index ${index} missing error message`);
        }
      });
    }
  
    private async validateLLMCompatibility(template: Template, errors: string[]): Promise<void> {
      const { llmPreferences, defaultParams } = template.configuration;
      
      // Check if preferred LLMs support the required features
      if (llmPreferences?.preferred) {
        for (const llmId of llmPreferences.preferred) {
          const llm = llmManager.getLLMById(llmId);
          if (llm) {
            // Check max tokens
            if (defaultParams.maxTokens > llm.maxTokens) {
              errors.push(`Default max tokens (${defaultParams.maxTokens}) exceeds LLM "${llmId}" limit of ${llm.maxTokens}`);
            }
  
            // Check output format compatibility
            const outputFormat = template.configuration.outputFormat;
            if (!llm.capabilities.includes(outputFormat.type)) {
              errors.push(`LLM "${llmId}" does not support output format "${outputFormat.type}"`);
            }
          }
        }
      }
    }
  }
  
  // Export singleton instance
  export const templateValidator = new TemplateValidator();