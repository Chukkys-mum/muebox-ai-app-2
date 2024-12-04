// app/actions/knowledgeBaseActions.ts

'use server';

import { KnowledgeBaseService, KnowledgeBaseFile } from '@/services/files/KnowledgeBaseService';
import { revalidatePath } from 'next/cache';

const knowledgeBaseService = new KnowledgeBaseService();

export async function createKnowledgeBaseAction(knowledgeBase: Omit<KnowledgeBaseFile, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const result = await knowledgeBaseService.createKnowledgeBase(knowledgeBase);
    if (result.success) {
      revalidatePath('/knowledge-bases');
    }
    return result;
  } catch (error) {
    console.error('Error creating knowledge base:', error);
    return { success: false, message: 'Failed to create knowledge base' };
  }
}