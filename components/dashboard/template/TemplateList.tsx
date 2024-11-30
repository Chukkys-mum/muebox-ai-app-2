// - TemplateList.tsx (template management UI)

// /components/template/TemplateList.tsx

import React, { useState, useEffect } from 'react';
import { Template, TemplateSearchParams } from '@/types/template/types';
import { templateManager } from '@/services/template/TemplateManager';
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
import { Search, Filter } from 'lucide-react';

interface TemplateListProps {
  onSelect?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  filter?: TemplateSearchParams;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  onSelect,
  onEdit,
  onDelete,
  filter: initialFilter
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<TemplateSearchParams>(initialFilter || {});

  useEffect(() => {
    loadTemplates();
  }, [filter]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const templates = await templateManager.listTemplates({
        ...filter,
        query: searchQuery
      });
      setTemplates(templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilter(prev => ({ ...prev, query }));
  };

  const handleCategoryFilter = (category: string) => {
    setFilter(prev => ({ ...prev, category: category as any }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Templates</CardTitle>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={filter.category}
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
              <Card
                key={template.id}
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
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-center">
          {templates.length > 0 && (
            <Button
              variant="outline"
              onClick={loadTemplates}
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