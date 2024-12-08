// components/shared/loading.tsx

export const LoadingPage = () => (
  <div className="flex items-center justify-center h-full min-h-[200px]">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
  </div>
);

export const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
);