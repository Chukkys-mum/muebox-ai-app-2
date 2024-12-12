// app/api/folders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { FileService } from '@/services/files/FileService';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fileService = new FileService();
    const folders = await fileService.getAvailableFolders(user.id);

    return NextResponse.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}