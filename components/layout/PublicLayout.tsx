// File: /components/layout/PublicLayout.tsx

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        {children}
      </div>
    );
  }
  