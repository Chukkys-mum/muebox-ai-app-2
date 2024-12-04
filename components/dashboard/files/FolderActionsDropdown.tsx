// components/dashboard/files/FolderActionsDropdown.tsx
// Similar dropdown for folder actions.

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  FiShare,
  FiMove,
  FiStar,
  FiEdit3,
  FiDownload,
  FiFlag,
  FiTrash2,
} from "react-icons/fi";
import { FileAction } from '@/types';

interface FolderActionsDropdownProps {
  onAction: (action: FileAction) => void;
  disabled?: boolean;
}

const menuOptions: { label: string; icon: JSX.Element; action: FileAction; className?: string }[] = [
  {
    label: "Share folder",
    icon: <FiShare />,
    action: "share" as FileAction,
  },
  {
    label: "Move to",
    icon: <FiMove />,
    action: "move" as FileAction,
  },
  {
    label: "Add to starred",
    icon: <FiStar />,
    action: "star" as FileAction,
  },
  {
    label: "Rename",
    icon: <FiEdit3 />,
    action: "rename" as FileAction,
  },
  {
    label: "Download",
    icon: <FiDownload />,
    action: "download" as FileAction,
  },
  {
    label: "Report",
    icon: <FiFlag />,
    action: "report" as FileAction,
  },
  {
    label: "Delete",
    icon: <FiTrash2 />,
    action: "delete" as FileAction,
    className: "text-red-500 hover:text-red-600",
  },
];

const FolderActionsDropdown: React.FC<FolderActionsDropdownProps> = ({ onAction, disabled }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-sm font-medium" disabled={disabled}>
          •••
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 border border-gray-200 dark:border-gray-700 rounded-md shadow-md">
        <DropdownMenuLabel className="px-4 py-2 text-xs text-gray-500 uppercase">
          Settings
        </DropdownMenuLabel>
        {menuOptions.map((option, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => onAction(option.action)}
            className={`flex items-center gap-2 px-4 py-2 text-sm ${
              option.className ? option.className : "text-gray-800 dark:text-gray-300"
            } hover:bg-gray-100 dark:hover:bg-gray-800`}
          >
            {option.icon}
            {option.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="border-t border-gray-200 dark:border-gray-700 my-1" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FolderActionsDropdown;