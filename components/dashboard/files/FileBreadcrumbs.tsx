// /components/dashboard/files/FileBreadcrumbs.tsx

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FiShare, FiEdit3, FiMove, FiTrash2 } from "react-icons/fi";

interface FolderActionsDropdownProps {
  onAction: (action: string) => void;
}

const FolderActionsDropdown: React.FC<FolderActionsDropdownProps> = ({
  onAction,
}) => {
  const menuOptions = [
    {
      label: "Share",
      icon: <FiShare />,
      action: "share",
    },
    {
      label: "Rename",
      icon: <FiEdit3 />,
      action: "rename",
    },
    {
      label: "Move",
      icon: <FiMove />,
      action: "move",
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
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 border border-zinc-200 dark:border-zinc-700">
        {menuOptions.map((option, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => onAction(option.action)}
            className={`flex items-center gap-2 ${
              option.className ? option.className : ""
            }`}
          >
            {option.icon}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FolderActionsDropdown;
