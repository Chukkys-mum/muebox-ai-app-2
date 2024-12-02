// /app/api/templates/[id]/route.ts
// GET /api/templates/[id] - Get template by ID

import { llmManager } from "@/services/llm/LLMManager";
import { scopeManager } from "@/services/llm/ScopeManager"; // Import the scopeManager instance
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  const { data, error } = await supabase
    .from('templates')
    .select(`
      *,
      scopes:scope_id(*),
      llm_configs:llm_id(*),
      categories:category_id(*),
      template_versions(*)
    `)
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// PUT /api/templates/[id] - Update template
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    const json = await request.json();

    // Validate updates
    if (json.scope_id) {
      const scope = await scopeManager.getScope(json.scope_id);
      if (!scope) {
        throw new Error('Invalid scope configuration');
      }
    }
    if (json.llm_id && !llmManager.getLLMById(json.llm_id)) {
      throw new Error('Invalid LLM configuration');
    }

    // Get current version
    const { data: current } = await supabase
      .from('templates')
      .select('version')
      .eq('id', params.id)
      .single();

    // Store previous version
    await supabase
      .from('template_versions')
      .insert([{
        template_id: params.id,
        version: current?.version,
        data: current
      }]);

    // Update template
    const { data, error } = await supabase
      .from('templates')
      .update({
        ...json,
        updated_at: new Date().toISOString(),
        version: (current?.version || 0) + 1
      })
      .eq('id', params.id)
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

// DELETE /api/templates/[id] - Soft delete template
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  const { error } = await supabase
    .from('templates')
    .update({ 
      archived: true,
      archived_at: new Date().toISOString()
    })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}