// File Path: utils/chat-storage.ts

import { supabaseAdmin } from '@/utils/supabase/admin'; // Supabase Admin Client
import { cacheResponse, getCachedResponse } from '@/utils/redis';
import { NextRequest } from 'next/server';

/**
 * Retrieve conversation from Redis or fallback to Supabase.
 * @param req - Next.js Request object to extract session information
 * @param chatId - Unique identifier for the chat session
 * @returns - Chat conversation messages
 */
export async function getConversation(req: NextRequest, chatId: string) {
  const cacheKey = `conversation:${chatId}`;
  const cachedResponse = await getCachedResponse(req, cacheKey);

  if (cachedResponse) {
    return cachedResponse;
  }

  // Fallback to database
  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch conversation from database:', error);
    return null;
  }

  // Cache database result for future requests
  await cacheResponse(req, cacheKey, data);
  return data;
}
