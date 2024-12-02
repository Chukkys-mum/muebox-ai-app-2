// /components/dashboard/template/TemplateRenderer.tsx

//  - TemplateRenderer.tsx (template usage UI)
import React from 'react';
import { Template } from '@/types/template/types';

interface TemplateRendererProps {
  template: Template;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  template,
  onComplete,
  onError
}) => {
  // Implementation here
  return <div>Template Renderer</div>;
};