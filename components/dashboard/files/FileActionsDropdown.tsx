// components/dashboard/files/FileActionsDropdown.tsx
// Dropdown for file actions like share, rename, delete, etc.


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
  FiEdit3,
  FiMove,
  FiDownload,
  FiTrash2,
  FiStar,
  FiFlag,
} from "react-icons/fi";
import { FileAction } from '@/types';

interface FileActionsDropdownProps {
  onAction: (action: FileAction) => void;
  disabled?: boolean;
}

const menuOptions: { label: string; icon: JSX.Element; action: FileAction; className?: string }[] = [
  {
    label: "Share file",
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

const FileActionsDropdown: React.FC<FileActionsDropdownProps> = ({ onAction, disabled }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-sm font-medium" disabled={disabled}>
          <FiEdit3 className="mr-2" />
          Settings
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 border border-zinc-200 dark:border-zinc-700 shadow-md rounded-md">
        <DropdownMenuLabel className="text-gray-500 text-xs uppercase px-4 py-2">
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
        <DropdownMenuSeparator className="border-t my-2 border-zinc-200 dark:border-zinc-700" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FileActionsDropdown;