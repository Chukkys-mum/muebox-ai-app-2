// /hooks/useEmailRefresh.ts

import { useState, useCallback, useRef, useEffect } from 'react';
import { useEmail } from '@/context/EmailContext';
import { toast } from '@/components/ui/use-toast';
import { emailSyncService } from '@/services/email/EmailSyncService';

interface UseEmailRefreshResult {
  refresh: () => Promise<void>;
  refreshing: boolean; 
  lastRefreshed: Date | null;
  error: Error | null;
  startAutoRefresh: (interval?: number) => void;
  stopAutoRefresh: () => void;
}

export function useEmailRefresh(autoRefreshInterval = 5 * 60 * 1000): UseEmailRefreshResult {
  const { setLoading, setError } = useEmail();
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [error, setRefreshError] = useState<Error | null>(null);
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    // Cancel any ongoing refresh
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      setRefreshing(true);
      setRefreshError(null);
      setLoading(true);

      // Get user ID from somewhere (context, session, etc.)
      const userId = await getUserId(); // You'll need to implement this

      // Start email sync
      await emailSyncService.syncAllAccounts(userId);
      
      setLastRefreshed(new Date());
      
      toast({
        title: "Refresh Complete",
        description: "Your emails have been synchronized",
      });
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refresh emails');
      setRefreshError(error);
      setError(error.message);
      
      toast({
        title: "Refresh Failed",
        description: error.message,
        variant: "destructive",
      });
      
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [setLoading, setError]);

  const startAutoRefresh = useCallback((interval?: number) => {
    stopAutoRefresh();
    const refreshInterval = interval || autoRefreshInterval;
    
    // Immediate refresh
    refresh();
    
    // Set up interval for future refreshes
    autoRefreshIntervalRef.current = setInterval(refresh, refreshInterval);
  }, [refresh, autoRefreshInterval]);

  const stopAutoRefresh = useCallback(() => {
    if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current);
      autoRefreshIntervalRef.current = null;
    }
  }, []);

  // Network status handling
  useEffect(() => {
    const handleOnline = () => {
      toast({
        title: "Back Online",
        description: "Refreshing your emails...",
      });
      refresh();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoRefresh();
      abortControllerRef.current?.abort();
    };
  }, [stopAutoRefresh]);

  // Visibility change handling for tab focus
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Add a small delay to prevent immediate refresh on tab switch
        timeoutId = setTimeout(() => {
          const timeSinceLastRefresh = lastRefreshed 
            ? Date.now() - lastRefreshed.getTime()
            : Infinity;

          // Only refresh if it's been more than 5 minutes
          if (timeSinceLastRefresh > 5 * 60 * 1000) {
            refresh();
          }
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(timeoutId);
    };
  }, [refresh, lastRefreshed]);

  // Helper function to get user ID (implement based on your auth system)
  const getUserId = async () => {
    // Implement this based on your auth system
    // For example:
    // const session = await getSession();
    // return session?.user?.id;
    throw new Error('getUserId not implemented');
  };

  return {
    refresh,
    refreshing,
    lastRefreshed,
    error,
    startAutoRefresh,
    stopAutoRefresh,
  };
}