// components/dashboard/files/FolderBreadcrumbs.tsx


import React from "react";

interface Breadcrumb {
  id: string;
  name: string;
  isKnowledgeBase?: boolean; // Indicate if this breadcrumb is part of a Knowledge Base
  path: string; // Path or URL to this breadcrumb
}

interface FolderBreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
  onBreadcrumbClick: (breadcrumb: Breadcrumb) => void; // Handler for breadcrumb clicks
}

const FolderBreadcrumbs: React.FC<FolderBreadcrumbsProps> = ({
  breadcrumbs,
  onBreadcrumbClick,
}) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-sm text-gray-500 dark:text-gray-400 mb-4"
    >
      <ul className="flex items-center space-x-2">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.id} className="flex items-center">
            <button
              className="hover:underline text-blue-600 dark:text-blue-400"
              onClick={() => onBreadcrumbClick(breadcrumb)}
            >
              {breadcrumb.isKnowledgeBase ? `📚 ${breadcrumb.name}` : breadcrumb.name}
            </button>
            {index < breadcrumbs.length - 1 && (
              <span className="mx-2 text-gray-400">/</span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default FolderBreadcrumbs;
