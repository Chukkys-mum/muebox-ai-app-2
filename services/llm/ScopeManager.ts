// /services/llm/ScopeManager.ts

import { Database } from '@/types/types_db';
import { 
  Scope, 
  ScopeManagerInterface, 
  ScopeType,
  ScopeContext,
  LLMPreferences
} from '@/types/llm/scope';
import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { convertToJson, convertFromJson, validateScopeContext, validateLLMPreferences } from '@/utils/type-converters';

export class ScopeManager implements ScopeManagerInterface {
  private scopes: Map<string, Scope>;
  private supabase;

  constructor() {
    this.scopes = new Map();
    this.supabase = createClient();
    this.initialize();
  }

  private mapDbScopeToScope(dbScope: Database['public']['Tables']['scopes']['Row']): Scope {
    const context = validateScopeContext(dbScope.context);
    const llmPreferences = validateLLMPreferences(dbScope.llm_preferences);
    
    return {
      id: dbScope.id,
      type: dbScope.type as ScopeType,
      name: dbScope.name,
      description: dbScope.description || undefined,
      context,
      llmPreferences,
      templateId: dbScope.template_id || undefined,
      metadata: dbScope.metadata as Record<string, any> || undefined,
      createdAt: new Date(dbScope.created_at),
      updatedAt: new Date(dbScope.updated_at)
    };
  }

  private mapScopeToDb(scope: Scope): Database['public']['Tables']['scopes']['Insert'] {
    return {
      id: scope.id,
      type: scope.type,
      name: scope.name,
      description: scope.description || null,
      context: convertToJson(scope.context),
      llm_preferences: scope.llmPreferences ? convertToJson(scope.llmPreferences) : null,
      template_id: scope.templateId || null,
      metadata: scope.metadata ? convertToJson(scope.metadata) : null,
      created_at: scope.createdAt.toISOString(),
      updated_at: scope.updatedAt.toISOString()
    };
  }

  private async initialize() {
    try {
      const { data: scopeData, error } = await this.supabase
        .from('scopes')
        .select('*');

      if (error) throw error;

      scopeData?.forEach(dbScope => {
        const scope = this.mapDbScopeToScope(dbScope);
        this.scopes.set(scope.id, scope);
      });
    } catch (error) {
      console.error('Failed to initialize scopes:', error);
    }
  }

  public async createScope(config: Partial<Scope>): Promise<Scope> {
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

    const dbScope = this.mapScopeToDb(newScope);
    
    const { data, error } = await this.supabase
      .from('scopes')
      .insert([dbScope])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create scope');

    const createdScope = this.mapDbScopeToScope(data);
    this.scopes.set(createdScope.id, createdScope);
    return createdScope;
  }

  public async updateScope(id: string, updates: Partial<Scope>): Promise<Scope> {
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
      llmPreferences: updates.llmPreferences ?? existingScope.llmPreferences,
      metadata: {
        ...existingScope.metadata,
        ...updates.metadata
      },
      updatedAt: new Date()
    };

    const dbScope = this.mapScopeToDb(updatedScope);

    const { data, error } = await this.supabase
      .from('scopes')
      .update(dbScope)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update scope');

    const refreshedScope = this.mapDbScopeToScope(data);
    this.scopes.set(id, refreshedScope);
    return refreshedScope;
  }

  public async getScope(id: string): Promise<Scope | null> {
    const cachedScope = this.scopes.get(id);
    if (cachedScope) return cachedScope;

    const { data, error } = await this.supabase
      .from('scopes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    const scope = this.mapDbScopeToScope(data);
    this.scopes.set(id, scope);
    return scope;
  }

  public async deleteScope(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('scopes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      this.scopes.delete(id);
      return true;
    } catch (error) {
      console.error(`Failed to delete scope ${id}:`, error);
      return false;
    }
  }

  public validateScope(scope: Scope): boolean {
    if (!scope.id || !scope.type || !scope.name || !scope.context) {
      return false;
    }

    // Validate context
    if (!Array.isArray(scope.context.goals) || scope.context.goals.length === 0) {
      return false;
    }

    if (!Array.isArray(scope.context.constraints)) {
      return false;
    }

    // Validate type
    const validTypes: ScopeType[] = ['chat', 'template', 'essay', 'custom'];
    if (!validTypes.includes(scope.type)) {
      return false;
    }

    // Validate LLM preferences if present
    if (scope.llmPreferences) {
      if (!Array.isArray(scope.llmPreferences.preferred) || 
          !Array.isArray(scope.llmPreferences.excluded)) {
        return false;
      }
    }

    return true;
  }

  public async listScopes(filter?: Partial<Scope>): Promise<Scope[]> {
    let query = this.supabase.from('scopes').select('*');

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'context' || key === 'llmPreferences' || key === 'metadata') {
            // Handle JSONB containment for object fields
            query = query.contains(key, value as Record<string, any>);
          } else if (key === 'type' || key === 'name') {
            // Exact match for simple fields
            query = query.eq(key, value);
          }
        }
      });
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data) return [];

    const scopes = data.map(dbScope => this.mapDbScopeToScope(dbScope));
    
    // Update cache
    scopes.forEach(scope => {
      this.scopes.set(scope.id, scope);
    });

    return scopes;
  }
}

// Export singleton instance
export const scopeManager = new ScopeManager();