// /components/error-boundary.tsx

'use client';

import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error boundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-6 max-w-lg mx-auto mt-8">
          <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
          <p className="text-sm text-gray-600 mb-4">
            {this.state.error?.message || 'An error occurred during authentication'}
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = '/dashboard/signin';
            }}
          >
            Try Again
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}