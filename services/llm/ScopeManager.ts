// services/llm/ScopeManager.ts
// Scope Management implementation

import { 
    Scope, 
    ScopeManagerInterface, 
    ScopeType 
  } from '@/types/llm/scope';
  import { createClient } from '@/utils/supabase/server';
  import { v4 as uuidv4 } from 'uuid';
  
  export class ScopeManager implements ScopeManagerInterface {
    private scopes: Map<string, Scope>;
    private supabase;
  
    constructor() {
      this.scopes = new Map();
      this.supabase = createClient();
      this.initialize();
    }
  
    private async initialize() {
      try {
        const { data: scopeData, error } = await this.supabase
          .from('scopes')
          .select('*');
  
        if (error) throw error;
  
        scopeData?.forEach(scope => {
          this.scopes.set(scope.id, {
            ...scope,
            createdAt: new Date(scope.created_at),
            updatedAt: new Date(scope.updated_at)
          });
        });
      } catch (error) {
        console.error('Failed to initialize scopes:', error);
      }
    }
  
    public createScope(config: Partial<Scope>): Scope {
      const now = new Date();
      const newScope: Scope = {
        id: uuidv4(),
        type: config.type || 'custom',
        name: config.name || 'New Scope',
        context: {
          goals: config.context?.goals || [],
          constraints: config.context?.constraints || [],
          sources: config.context?.sources || [],
          format: config.context?.format,
          customInstructions: config.context?.customInstructions,
          tone: config.context?.tone,
          language: config.context?.language
        },
        llmPreferences: config.llmPreferences || {
          preferred: [],
          excluded: [],
          fallback: []
        },
        templateId: config.templateId,
        metadata: config.metadata || {},
        createdAt: now,
        updatedAt: now
      };
  
      try {
        // Store in database
        const { error } = this.supabase
          .from('scopes')
          .insert([{
            ...newScope,
            created_at: newScope.createdAt.toISOString(),
            updated_at: newScope.updatedAt.toISOString()
          }]);
  
        if (error) throw error;
  
        // Add to local cache
        this.scopes.set(newScope.id, newScope);
        return newScope;
      } catch (error) {
        console.error('Failed to create scope:', error);
        throw error;
      }
    }
  
    public updateScope(id: string, updates: Partial<Scope>): Scope {
      const existingScope = this.scopes.get(id);
      if (!existingScope) {
        throw new Error(`Scope not found with ID: ${id}`);
      }
  
      const updatedScope: Scope = {
        ...existingScope,
        ...updates,
        context: {
          ...existingScope.context,
          ...updates.context
        },
        llmPreferences: {
          ...existingScope.llmPreferences,
          ...updates.llmPreferences
        },
        metadata: {
          ...existingScope.metadata,
          ...updates.metadata
        },
        updatedAt: new Date()
      };
  
      try {
        const { error } = this.supabase
          .from('scopes')
          .update({
            ...updatedScope,
            updated_at: updatedScope.updatedAt.toISOString()
          })
          .eq('id', id);
  
        if (error) throw error;
  
        this.scopes.set(id, updatedScope);
        return updatedScope;
      } catch (error) {
        console.error(`Failed to update scope ${id}:`, error);
        throw error;
      }
    }
  
    public getScope(id: string): Scope | null {
      return this.scopes.get(id) || null;
    }
  
    public deleteScope(id: string): boolean {
      try {
        const { error } = this.supabase
          .from('scopes')
          .delete()
          .eq('id', id);
  
        if (error) throw error;
  
        return this.scopes.delete(id);
      } catch (error) {
        console.error(`Failed to delete scope ${id}:`, error);
        throw error;
      }
    }
  
    public validateScope(scope: Scope): boolean {
      // Implement validation logic
      const requiredFields = ['id', 'type', 'name', 'context'];
      const hasRequiredFields = requiredFields.every(field => scope[field]);
      
      if (!hasRequiredFields) return false;
  
      // Validate context
      const hasValidContext = scope.context.goals?.length > 0;
      if (!hasValidContext) return false;
  
      // Validate type
      const validTypes: ScopeType[] = ['chat', 'template', 'essay', 'custom'];
      if (!validTypes.includes(scope.type)) return false;
  
      return true;
    }
  
    public listScopes(filter?: Partial<Scope>): Scope[] {
      let scopes = Array.from(this.scopes.values());
  
      if (filter) {
        scopes = scopes.filter(scope => {
          return Object.entries(filter).every(([key, value]) => {
            if (key === 'context' || key === 'llmPreferences' || key === 'metadata') {
              return JSON.stringify(scope[key]).includes(JSON.stringify(value));
            }
            return scope[key] === value;
          });
        });
      }
  
      return scopes;
    }
  }
  
  // Export singleton instance
  export const scopeManager = new ScopeManager();