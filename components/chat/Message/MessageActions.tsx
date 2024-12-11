// File: components/chat/Message/MessageActions.tsx

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { MessageActionProps } from '@/types/chat';
import { MoreHorizontal, Edit, Trash2, Reply, Copy, Pin } from 'lucide-react';

export function MessageActions({
  message,
  currentUser,
  onEdit,
  onDelete,
  onReply,
  onPin,
  variant = 'sent'
}: MessageActionProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const canEdit = message.sender.id === currentUser.id || currentUser.role === 'admin';
  const canDelete = message.sender.id === currentUser.id || currentUser.role === 'admin';

  const handleCopy = (event: React.MouseEvent) => {
    event.preventDefault();
    navigator.clipboard.writeText(message.content);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={variant === 'sent' ? 'end' : 'start'}>
          {canEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          {onReply && (
            <DropdownMenuItem onClick={onReply}>
              <Reply className="mr-2 h-4 w-4" />
              Reply
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </DropdownMenuItem>
          {onPin && (
            <DropdownMenuItem onClick={onPin}>
              <Pin className="mr-2 h-4 w-4" />
              Pin
            </DropdownMenuItem>
          )}
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}