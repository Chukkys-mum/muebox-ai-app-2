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

interface FileActionsDropdownProps {
  onAction: (action: string) => void;
}

const FileActionsDropdown: React.FC<FileActionsDropdownProps> = ({ onAction }) => {
  const menuOptions = [
    {
      label: "Share file",
      icon: <FiShare />,
      action: "share",
    },
    {
      label: "Move to",
      icon: <FiMove />,
      action: "move",
    },
    {
      label: "Add to starred",
      icon: <FiStar />,
      action: "star",
    },
    {
      label: "Rename",
      icon: <FiEdit3 />,
      action: "rename",
    },
    {
      label: "Download",
      icon: <FiDownload />,
      action: "download",
    },
    {
      label: "Report",
      icon: <FiFlag />,
      action: "report",
    },
    {
      label: "Delete",
      icon: <FiTrash2 />,
      action: "delete",
      className: "text-red-500 hover:text-red-600",
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-sm font-medium">
          <FiEdit3 className="mr-2" /> {/* Optional: Replace with a trigger icon */}
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
