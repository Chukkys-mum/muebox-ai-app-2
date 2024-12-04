// /app/dashboard/email/error.tsx

'use client';

import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  RefreshCcw,
  Home,
  ChevronLeft
} from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function EmailError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to your error reporting service
    console.error('Email section error:', error);
  }, [error]);

  const isAuthError = error.message.includes('authentication') || error.message.includes('unauthorized');
  const isNetworkError = error.message.includes('network') || error.message.includes('failed to fetch');
  const isPermissionError = error.message.includes('permission') || error.message.includes('access denied');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
            {isAuthError ? (
            'Authentication failed. Please try signing in again.'
            ) : isNetworkError ? (
            'Network connection issue. Please check your internet connection.'
            ) : isPermissionError ? (
            'You don\'t have permission to access this section.'
            ) : (
            error.message || 'An unexpected error occurred.'
            )}
        </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto"
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>

          <Button 
            onClick={() => reset()}
            className="w-full sm:w-auto"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>

        {(isAuthError || isPermissionError) && (
          <Button
            variant="link"
            onClick={() => router.push('/auth/signin')}
            className="w-full"
          >
            Sign in again
          </Button>
        )}

        <div className="text-sm text-muted-foreground text-center mt-4">
          If this problem persists, please contact support with error code:{' '}
          <code className="font-mono bg-muted px-1 py-0.5 rounded">
            {error.digest || 'NO_DIGEST'}
          </code>
        </div>
      </div>
    </div>
  );
}