// /app/dashboard/email/loading.tsx

import { Skeleton } from "@/components/ui/skeleton";
import { 
  Archive, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCcw, 
  Star, 
  Tag, 
  Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmailLoading() {
  // Create an array of 10 items for the loading skeletons
  const loadingItems = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar loading state */}
      <div className="border-b p-2 flex items-center justify-between sticky top-0 bg-background z-10">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-4" />
          <Button 
            variant="ghost" 
            size="icon"
            disabled
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Button variant="ghost" size="icon" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Action bar loading state */}
      <div className="border-b p-2 flex items-center gap-2 bg-muted/50">
        <Button variant="ghost" size="icon" disabled>
          <Archive className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" disabled>
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" disabled>
          <Tag className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" disabled>
          <Star className="h-4 w-4" />
        </Button>
      </div>

      {/* Email list loading state */}
      <div className="flex-1 overflow-auto">
        {loadingItems.map((index) => (
          <div 
            key={index}
            className="flex items-center gap-4 p-4 border-b"
          >
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
              <Skeleton className="h-4 w-full max-w-lg" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      {/* Loading overlay for initial load */}
      <div className="absolute inset-0 bg-background/50 flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <div className="text-sm text-muted-foreground">Loading your emails...</div>
        </div>
      </div>
    </div>
  );
}