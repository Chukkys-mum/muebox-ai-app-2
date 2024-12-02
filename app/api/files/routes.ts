// app/api/files/route.ts
import { NextResponse } from 'next/server';
import { FileService } from '@/services/files/FileService';

export async function GET() {
  const fileService = new FileService();
  const files = await fileService.fetchFiles();
  
  return NextResponse.json(files, {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=59',
    },
  });
}