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

interface FolderActionsDropdownProps {
  onAction: (action: string) => void;
}

const FolderActionsDropdown: React.FC<FolderActionsDropdownProps> = ({
  onAction,
}) => {
  const menuOptions = [
    {
      label: "Share folder",
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
