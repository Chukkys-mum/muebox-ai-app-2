// app/api/files/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { FileService } from '@/services/files/FileService';

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fileService = new FileService();
    const files = await fileService.fetchFiles(user.id); // Assuming we want to fetch files for the authenticated user

    return NextResponse.json(files, {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}