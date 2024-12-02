// /app/api/templates/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { llmManager } from '@/services/llm/LLMManager';
import { scopeManager } from '@/services/llm/ScopeManager';

// GET /api/templates - List templates with optional filtering
export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { searchParams } = new URL(request.url);
  
  // Query parameters
  const category = searchParams.get('category');
  const scope = searchParams.get('scope');
  const llm = searchParams.get('llm');
  const query = searchParams.get('query');

  let queryBuilder = supabase
    .from('templates')
    .select(`
      *,
      scopes:scope_id(*),
      llm_configs:llm_id(*),
      categories:category_id(*)
    `)
    .eq('archived', false);

  // Apply filters
  if (category) {
    queryBuilder = queryBuilder.eq('category_id', category);
  }
  if (scope) {
    queryBuilder = queryBuilder.eq('scope_id', scope);
  }
  if (llm) {
    queryBuilder = queryBuilder.eq('llm_id', llm);
  }
  if (query) {
    queryBuilder = queryBuilder.or(`
      name.ilike.%${query}%,
      description.ilike.%${query}%,
      tags.cs.{${query}}
    `);
  }

  const { data, error } = await queryBuilder;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/templates - Create new template
export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    const json = await request.json();
    
    // Validate scope configuration
    if (json.scope_id && !scopeManager.getScope(json.scope_id)) {
      throw new Error('Invalid scope configuration');
    }

    // Validate LLM configuration
    if (json.llm_id && !llmManager.getLLMById(json.llm_id)) {
      throw new Error('Invalid LLM configuration');
    }

    // Insert template with related data
    const { data, error } = await supabase
      .from('templates')
      .insert([{
        ...json,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
        archived: false
      }])
      .select(`
        *,
        scopes:scope_id(*),
        llm_configs:llm_id(*),
        categories:category_id(*)
      `)
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}