// components/shared/ErrorBoundary.tsx

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const DefaultFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center p-4 text-red-500">
      <h2 className="text-lg font-semibold">An unexpected error occurred</h2>
      <p className="mt-2 text-sm">{error.message}</p>
      <div className="mt-4">
        <button
          onClick={resetError}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 mr-4"
        >
          Retry
        </button>
        <button
          onClick={() => router.push('/login')}
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('ErrorBoundary caught an error', { error, info });
  }

  public resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}
