// /services/template/TemplateManager.ts

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { 
  Template, 
  TemplateManagerInterface, 
  TemplateSearchParams, 
  TemplateUsage,
  DbTemplate,
  DbTemplateUsage,
  DbTemplateVersion,
  domainToDb,
  dbToDomain
} from '@/types/template/types';
import { templateValidator } from './TemplateValidator';
import { Json } from '@/types/types_db';

export class TemplateManager implements TemplateManagerInterface {
  private async getSupabaseClient() {
    const cookieStore = cookies();
    return createClient();
  }

  public async createTemplate(template: Omit<Template, 'id'>): Promise<Template> {
    const supabase = await this.getSupabaseClient();
    
    try {
      // Validate template structure
      const validation = await templateValidator.validateTemplate(template as Template);
      if (!validation.isValid) {
        throw new Error(`Invalid template structure: ${validation.errors.join(', ')}`);
      }

      // Convert to DB format
      const dbTemplate = domainToDb(template as Template);

      // Store in database
      const { data, error } = await supabase
        .from('templates')
        .insert([dbTemplate])
        .select()
        .single();

      if (error) throw error;

      // Store version history
      await this.createVersionRecord(dbToDomain(data));

      return dbToDomain(data);
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  }

  public async getTemplate(id: string, version?: string): Promise<Template | null> {
    const supabase = await this.getSupabaseClient();
    
    try {
      if (version) {
        return this.getTemplateVersion(id, version);
      }

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return null;

      return dbToDomain(data);
    } catch (error) {
      console.error('Failed to get template:', error);
      return null;
    }
  }

  public async updateTemplate(id: string, updates: Partial<Template>): Promise<Template> {
    const supabase = await this.getSupabaseClient();
    
    try {
      const currentTemplate = await this.getTemplate(id);
      if (!currentTemplate) {
        throw new Error('Template not found');
      }

      const updatedTemplate = {
        ...currentTemplate,
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Validate updated template
      const validation = await templateValidator.validateTemplate(updatedTemplate);
      if (!validation.isValid) {
        throw new Error(`Invalid template structure: ${validation.errors.join(', ')}`);
      }

      // Convert to DB format
      const dbTemplate = domainToDb(updatedTemplate);

      // Update in database
      const { data, error } = await supabase
        .from('templates')
        .update(dbTemplate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Store new version in history
      await this.createVersionRecord(updatedTemplate);

      return dbToDomain(data);
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  }

  public async deleteTemplate(id: string): Promise<boolean> {
    const supabase = await this.getSupabaseClient();
    
    try {
      const { error } = await supabase
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
    const supabase = await this.getSupabaseClient();
    
    try {
      let query = supabase
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

      return data.map(dbToDomain);
    } catch (error) {
      console.error('Failed to list templates:', error);
      return [];
    }
  }

  public async validateTemplate(template: Template): Promise<boolean> {
    const validation = await templateValidator.validateTemplate(template);
    return validation.isValid;
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
      const { id, ...templateWithoutId } = template;
      return await this.createTemplate(templateWithoutId);
    } catch (error) {
      throw new Error('Failed to import template: Invalid format');
    }
  }

  public async getTemplateUsage(id: string): Promise<TemplateUsage[]> {
    const supabase = await this.getSupabaseClient();
    
    try {
      const { data, error } = await supabase
        .from('template_usage')
        .select('*')
        .eq('template_id', id)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return data.map(usage => ({
        id: usage.id,
        template_id: usage.template_id,
        user_id: usage.user_id,
        timestamp: usage.timestamp,
        inputs: usage.inputs,
        result: usage.result,
        metrics: usage.metrics
      }));
    } catch (error) {
      console.error('Failed to get template usage:', error);
      return [];
    }
  }

  private async getTemplateVersion(templateId: string, version: string): Promise<Template | null> {
    const supabase = await this.getSupabaseClient();
    
    const { data, error } = await supabase
      .from('template_versions')
      .select('*')
      .eq('template_id', templateId)
      .eq('version', version)
      .single();

    if (error || !data) return null;
    
    return dbToDomain(data.template_data as unknown as DbTemplate);
  }

  private async createVersionRecord(template: Template): Promise<void> {
    const supabase = await this.getSupabaseClient();
    
    try {
      const versionRecord: DbTemplateVersion = {
        id: crypto.randomUUID(), // or however you generate IDs
        template_id: template.id,
        version: template.version,
        changes: [],
        template_data: domainToDb(template) as unknown as Json,
        created_at: new Date().toISOString(),
        created_by: template.metadata.author
        };

      await supabase
        .from('template_versions')
        .insert([versionRecord]);
    } catch (error) {
      console.error('Failed to create version record:', error);
    }
  }
}

// Export singleton instance
export const templateManager = new TemplateManager();