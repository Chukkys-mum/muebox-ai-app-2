// app/api/knowledgebases/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { KnowledgeBaseService } from '@/services/files/KnowledgeBaseService';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const knowledgeBaseService = new KnowledgeBaseService();
    const knowledgeBases = await knowledgeBaseService.getAvailableKnowledgeBases(user.id);

    return NextResponse.json(knowledgeBases);
  } catch (error) {
    console.error('Error fetching knowledge bases:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}