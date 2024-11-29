// /components/dashboard/files/PinnedItems.tsx 

import React from "react";

const PinnedItems = () => {
  const pinnedItems = [
    { id: 1, name: "Project Specs", type: "file" },
    { id: 2, name: "Design Assets", type: "folder" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {pinnedItems.map((item) => (
        <div
          key={item.id}
          className="p-4 border rounded-lg bg-white dark:bg-zinc-800 hover:shadow-md transition"
        >
          <h3 className="text-sm font-medium text-zinc-900 dark:text-white truncate">
            {item.name}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {item.type === "file" ? "File" : "Folder"}
          </p>
        </div>
      ))}
    </div>
  );
};

export default PinnedItems;

