// - TemplateManager.ts (core template service)

// /services/template/TemplateManager.ts

import { createClient } from '@/utils/supabase/server';
import type { Database } from '@/types/types_db';
import { 
  Template, 
  TemplateManagerInterface, 
  TemplateSearchParams, 
  TemplateUsage,
  ValidationRule 
} from '@/types/template/types';
import { v4 as uuidv4 } from 'uuid';
import { JSONSchema7, validate as validateSchema } from 'json-schema';

// Define Json type from Database type
type DbJson = string | number | boolean | null | { [key: string]: DbJson } | DbJson[];

const getUserId = () => {
    // Implement your user ID retrieval logic here
    return 'current-user-id'; // Replace with actual implementation
  };

export class TemplateManager implements TemplateManagerInterface {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  public async createTemplate(template: Omit<Template, 'id'>): Promise<Template> {
    try {
      // Validate template structure
      const isValid = await this.validateTemplate({
        ...template,
        id: 'temp-id' // Temporary ID for validation
      });

      if (!isValid) {
        throw new Error('Invalid template structure');
      }

      const newTemplate: Template = {
        ...template,
        id: uuidv4(),
        metadata: {
          ...template.metadata,
          created: new Date(),
          modified: new Date(),
          usageCount: 0
        }
      };

      // Store in database
      const { data, error } = await this.supabase
      .from('templates')
      .insert([{
        id: newTemplate.id,
        name: newTemplate.name,
        description: newTemplate.description,
        category: newTemplate.category,
        configuration: JSON.stringify(newTemplate.configuration),
        metadata: JSON.stringify(newTemplate.metadata),
        prompts: JSON.stringify(newTemplate.prompts),
        validation: JSON.stringify(newTemplate.validation),
        user_id: getUserId(),
        version: newTemplate.version,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived: false
      }])
      .select()
      .single();

      if (error) throw error;

      // Store version history
      await this.createVersionRecord(newTemplate);

      return this.parseTemplateFromDB(data);
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  }

  public async getTemplate(id: string, version?: string): Promise<Template | null> {
    try {
      let query = this.supabase
        .from('templates')
        .select('*')
        .eq('id', id);

      const { data, error } = await query.single();

      if (error || !data) return null;

      // If specific version requested, get from version history
      if (version && version !== data.version) {
        const versionData = await this.getTemplateVersion(id, version);
        if (versionData) return versionData.template;
      }

      return this.parseTemplateFromDB(data);
    } catch (error) {
      console.error('Failed to get template:', error);
      return null;
    }
  }

  public async updateTemplate(id: string, updates: Partial<Template>): Promise<Template> {
    try {
      const currentTemplate = await this.getTemplate(id);
      if (!currentTemplate) {
        throw new Error('Template not found');
      }

      const updatedTemplate: Template = {
        ...currentTemplate,
        ...updates,
        metadata: {
          ...currentTemplate.metadata,
          ...updates.metadata,
          modified: new Date()
        },
        version: this.incrementVersion(currentTemplate.version)
      };

      // Validate updated template
      const isValid = await this.validateTemplate(updatedTemplate);
      if (!isValid) {
        throw new Error('Invalid template structure');
      }

      // Update in database
      const { data, error } = await this.supabase
        .from('templates')
        .update({
          ...updatedTemplate,
          configuration: JSON.stringify(updatedTemplate.configuration),
          metadata: JSON.stringify(updatedTemplate.metadata)
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Store new version in history
      await this.createVersionRecord(updatedTemplate);

      return this.parseTemplateFromDB(data);
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  }

  public async deleteTemplate(id: string): Promise<boolean> {
    try {
      // Archive template instead of deleting
      const { error } = await this.supabase
        .from('templates')
        .update({ archived: true })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to delete template:', error);
      return false;
    }
  }

  public async listTemplates(params?: TemplateSearchParams): Promise<Template[]> {
    try {
      let query = this.supabase
        .from('templates')
        .select('*')
        .eq('archived', false);

      if (params) {
        if (params.category) {
          query = query.eq('category', params.category);
        }
        if (params.author) {
          query = query.eq('metadata->author', params.author);
        }
        if (params.isPublic !== undefined) {
          query = query.eq('metadata->isPublic', params.isPublic);
        }
        if (params.tags && params.tags.length > 0) {
          query = query.contains('metadata->tags', params.tags);
        }
        if (params.query) {
          query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(this.parseTemplateFromDB);
    } catch (error) {
      console.error('Failed to list templates:', error);
      return [];
    }
  }

  public async validateTemplate(template: Template): Promise<boolean> {
    try {
      // Validate basic structure
      if (!template.name || !template.category || !template.prompts.main) {
        return false;
      }

      // Validate input schema
      const inputSchemaValid = validateSchema(
        template.configuration.inputSchema,
        template.configuration.inputSchema as JSONSchema7
      );

      if (!inputSchemaValid) {
        return false;
      }

      // Validate prompt variables match schema
      const declaredVariables = template.prompts.variables || [];
      const schemaProperties = Object.keys(template.configuration.inputSchema.properties || {});
      
      const allVariablesInSchema = declaredVariables.every(
        variable => schemaProperties.includes(variable)
      );

      if (!allVariablesInSchema) {
        return false;
      }

      // Validate custom validation rules
      const validRules = template.validation.every(
        rule => this.validateRule(rule)
      );

      return validRules;
    } catch (error) {
      console.error('Template validation failed:', error);
      return false;
    }
  }

  public async exportTemplate(id: string): Promise<string> {
    const template = await this.getTemplate(id);
    if (!template) {
      throw new Error('Template not found');
    }
    return JSON.stringify(template, null, 2);
  }

  public async importTemplate(data: string): Promise<Template> {
    try {
      const template = JSON.parse(data);
      
      // Remove any existing ID to create as new
      delete template.id;
      
      return await this.createTemplate(template);
    } catch (error) {
      console.error('Failed to import template:', error);
      throw error;
    }
  }

  private mapDbToTemplateUsage(data: Database['public']['Tables']['template_usage']['Row']): TemplateUsage {
    return {
      id: data.id,
      templateId: data.template_id,
      userId: data.user_id,
      timestamp: new Date(data.timestamp),
      inputs: data.inputs as Record<string, any>,
      result: data.result as any,
      metrics: data.metrics as any
    };
  }

  public async getTemplateUsage(id: string): Promise<TemplateUsage[]> {
    try {
      const { data, error } = await this.supabase
        .from('template_usage')
        .select('*')
        .eq('template_id', id)
        .order('timestamp', { ascending: false });
  
      if (error) throw error;
      return data.map(this.mapDbToTemplateUsage);
    } catch (error) {
      console.error('Failed to get template usage:', error);
      return [];
    }
  }

  private validateRule(rule: ValidationRule): boolean {
    // Implement validation rule checking
    return true; // Placeholder
  }

  private incrementVersion(version: string): string {
    const [major, minor, patch] = version.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }

  
private mapTemplateToDb(template: Template): Database['public']['Tables']['templates']['Insert'] {
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      metadata: template.metadata as Json,
      configuration: template.configuration as Json,
      prompts: template.prompts as Json,
      validation: template.validation as Json,
      version: template.version,
      user_id: getUserId(), // You need to implement this to get the current user ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      archived: false
    };
  }

  private async createVersionRecord(template: Template): Promise<void> {
    try {
      const versionRecord = {
        template_id: template.id,
        version: template.version,
        changes: [] as Json, // Add your changes tracking logic
        template_data: template as Json,
        created_at: new Date().toISOString(),
        created_by: template.metadata.author
      };
  
      await this.supabase
        .from('template_versions')
        .insert([versionRecord]);
    } catch (error) {
      console.error('Failed to create version record:', error);
    }
  }

  private async getTemplateVersion(templateId: string, version: string) {
    const { data, error } = await this.supabase
      .from('template_versions')
      .select('*')
      .eq('templateId', templateId)
      .eq('version', version)
      .single();
  
    if (error || !data) return null;
    return this.parseTemplateFromDB(data.template_data as any);
  }

  private parseTemplateFromDB(data: any): Template {
    return {
      ...data,
      configuration: typeof data.configuration === 'string' 
        ? JSON.parse(data.configuration) 
        : data.configuration,
      metadata: typeof data.metadata === 'string'
        ? JSON.parse(data.metadata)
        : data.metadata
    };
  }
}

// Export singleton instance
export const templateManager = new TemplateManager();