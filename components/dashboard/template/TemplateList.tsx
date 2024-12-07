// /components/template/TemplateList.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { Template, TemplateSearchParams } from '@/types/template/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';

interface TemplateListProps {
  initialTemplates: Template[];
  onSelect?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  initialTemplates,
  onSelect,
  onEdit,
  onDelete
}) => {
  const [searchParams, setSearchParams] = useState<TemplateSearchParams>({});
  const { templates, loading, error, mutate } = useTemplates(initialTemplates, searchParams);

  const handleSearch = useCallback((query: string) => {
    setSearchParams(prev => ({ ...prev, query }));
  }, []);

  const handleCategoryFilter = useCallback((category: string) => {
    setSearchParams(prev => ({ ...prev, category: category as any }));
  }, []);

  const handleDelete = useCallback(async (template: Template) => {
    if (onDelete) {
      await onDelete(template);
      mutate();
    }
  }, [onDelete, mutate]);

  if (error) {
    return <div>Error loading templates: {error.message}</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Templates</CardTitle>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchParams.query || ''}
              onChange={e => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={searchParams.category}
            onValueChange={handleCategoryFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="essay">Essay</SelectItem>
              <SelectItem value="analysis">Analysis</SelectItem>
              <SelectItem value="code">Code</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No templates found
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-center">
          {templates.length > 0 && (
            <Button
              variant="outline"
              onClick={() => mutate()}
              className="w-full max-w-xs"
            >
              Load More
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const TemplateCard: React.FC<{
  template: Template;
  onSelect?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
}> = React.memo(({ template, onSelect, onEdit, onDelete }) => (
  <Card
    className="hover:bg-muted/50 cursor-pointer p-4"
    onClick={() => onSelect?.(template)}
  >
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium">{template.name}</h3>
          <Badge variant={template.metadata.isPublic ? "default" : "secondary"}>
            {template.metadata.isPublic ? "Public" : "Private"}
          </Badge>
          <Badge variant="outline">{template.category}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {template.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {template.metadata.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(template);
          }}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(template);
          }}
        >
          Delete
        </Button>
      </div>
    </div>
    <div className="mt-2 text-xs text-muted-foreground">
      <span>Created: {new Date(template.metadata.created).toLocaleDateString()}</span>
      <span className="mx-2">•</span>
      <span>Modified: {new Date(template.metadata.modified).toLocaleDateString()}</span>
      <span className="mx-2">•</span>
      <span>Uses: {template.metadata.usageCount}</span>
    </div>
  </Card>
));

TemplateCard.displayName = 'TemplateCard';