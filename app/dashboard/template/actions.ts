// app/dashboard/template/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { templateManager } from '@/services/template/TemplateManager';
import { Template } from '@/types/template/types';

export async function createTemplate(template: Template) {
  await templateManager.createTemplate(template);
  revalidatePath('/dashboard/template');
}

export async function updateTemplate(id: string, template: Template) {
  await templateManager.updateTemplate(id, template);
  revalidatePath('/dashboard/template');
}

export async function deleteTemplate(id: string) {
  await templateManager.deleteTemplate(id);
  revalidatePath('/dashboard/template');
}