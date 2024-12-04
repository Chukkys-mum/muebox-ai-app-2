// /services/template/TemplateService.ts

import { 
    Template, 
    TemplateUsage, 
    TemplateSearchParams,
    DbTemplate, 
    DbTemplateUsage,
    domainToDb,
    dbToDomain
  } from '@/types/template/types';
  import { supabase } from '@/utils/supabase/client';
  
  class TemplateService {
    async createTemplate(template: Omit<Template, 'id'>): Promise<Template> {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(domainToDb(template as Template))
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create template');
      }
  
      const { data } = await response.json();
      return dbToDomain(data);
    }
  
    async getTemplate(id: string, version?: string): Promise<Template | null> {
      const response = await fetch(`/api/templates/${id}${version ? `?version=${version}` : ''}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch template');
      }
  
      const { data } = await response.json();
      return data ? dbToDomain(data) : null;
    }
  
    async updateTemplate(id: string, updates: Partial<Template>): Promise<Template> {
        type DbTemplateKey = keyof DbTemplate;
        const jsonFields = ['metadata', 'configuration', 'prompts', 'validation'];
        const dbUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (jsonFields.includes(key)) {
            (acc as any)[key] = JSON.stringify(value);
        } else {
            (acc as any)[key] = value;
        }
        return acc;
        }, {} as Partial<DbTemplate>);
  
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dbUpdates)
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update template');
      }
  
      const { data } = await response.json();
      return dbToDomain(data);
    }
  
    async deleteTemplate(id: string): Promise<boolean> {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE'
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete template');
      }
  
      return true;
    }
  
    async listTemplates(params?: TemplateSearchParams): Promise<Template[]> {
      const queryParams = new URLSearchParams();
      
      if (params) {
        if (params.category) queryParams.set('category', params.category);
        if (params.author) queryParams.set('author', params.author);
        if (params.query) queryParams.set('query', params.query);
        if (params.isPublic !== undefined) queryParams.set('isPublic', String(params.isPublic));
        if (params.tags?.length) queryParams.set('tags', params.tags.join(','));
      }
  
      const response = await fetch(`/api/templates?${queryParams.toString()}`);
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch templates');
      }
  
      const { data } = await response.json();
      return data.map(dbToDomain);
    }
  
    async getTemplateUsage(id: string): Promise<TemplateUsage[]> {
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
    }
  
    async validateTemplate(template: Template): Promise<{ isValid: boolean; errors: string[] }> {
      const response = await fetch('/api/templates/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(domainToDb(template))
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to validate template');
      }
  
      return response.json();
    }
  
    async exportTemplate(id: string): Promise<string> {
      const template = await this.getTemplate(id);
      if (!template) {
        throw new Error('Template not found');
      }
      return JSON.stringify(template, null, 2);
    }
  
    async importTemplate(data: string): Promise<Template> {
      try {
        const template = JSON.parse(data);
        const { id, ...templateWithoutId } = template;
        return await this.createTemplate(templateWithoutId);
      } catch (error) {
        throw new Error('Failed to import template: Invalid format');
      }
    }
  }
  
  // Export singleton instance
  export const templateService = new TemplateService();