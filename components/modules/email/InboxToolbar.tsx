// /components/modules/email/InboxToolbar.tsx

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Star,
  Tag,
  Trash2,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InboxToolbarProps {
  selectedCount: number;
  totalEmails: number;
  currentPage: number;
  totalPages: number;
  onSelectAll: (checked: boolean) => void;
  onRefresh: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onStar: () => void;
  onTag: () => void;
}

const InboxToolbar = ({
  selectedCount,
  totalEmails,
  currentPage,
  totalPages,
  onSelectAll,
  onRefresh,
  onPreviousPage,
  onNextPage,
  onArchive,
  onDelete,
  onStar,
  onTag,
}: InboxToolbarProps) => {
  return (
    <div className="sticky top-0 z-10 bg-white border-b">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectedCount > 0}
            onCheckedChange={onSelectAll}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            className="h-8 w-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>
            {selectedCount
              ? `Selected ${selectedCount}`
              : `${currentPage * 50 - 49}-${Math.min(
                  currentPage * 50,
                  totalEmails
                )} of ${totalEmails}`}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousPage}
            disabled={currentPage === 1}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextPage}
            disabled={currentPage === totalPages}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 p-2 bg-gray-50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onArchive}
                className="h-8 w-8"
              >
                <Archive className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onStar}
                className="h-8 w-8"
              >
                <Star className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Star</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onTag}
                className="h-8 w-8"
              >
                <Tag className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Tag</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default InboxToolbar;