// /hooks/useTemplates.ts
import useSWR from 'swr';
import { Template, TemplateSearchParams } from '@/types/template/types';
import { templateManager } from '@/services/template/TemplateManager';

export function useTemplates(initialData: Template[], searchParams: TemplateSearchParams) {
  const { data, error, mutate } = useSWR(
    ['templates', searchParams],
    () => templateManager.listTemplates(searchParams),
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
    }
  );

  return {
    templates: data,
    loading: !error && !data,
    error,
    mutate,
  };
}