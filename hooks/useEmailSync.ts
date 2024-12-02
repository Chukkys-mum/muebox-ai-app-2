// /hooks/useEmailSync.ts

import { useState, useEffect } from 'react';
import { emailSyncService, setupEmailSyncAction, cleanupEmailSyncAction } from '@/services/email/EmailSyncService';
import { realTimeSyncService } from '@/services/email/RealTimeSyncService';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

// Define a type for the payload if possible, or use 'any' if it's variable
type SyncPayload = any;

export function useEmailSync(userId: string) {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const router = useRouter();

  // Function to sync all email accounts for a user
  const syncAllAccounts = async () => {
    if (syncing) return;
    
    setSyncing(true);
    try {
      await setupEmailSyncAction(userId);
      setLastSyncTime(new Date());
      toast({
        title: "Sync Complete",
        description: "Your emails have been synchronized",
      });
      router.refresh(); // Refresh the page to reflect new data
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize your emails",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Initial setup and cleanup
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupSync = async () => {
      try {
        // Start real-time sync
        unsubscribe = realTimeSyncService.subscribe(userId, (payload: SyncPayload) => {
          // Handle real-time updates here
          console.log('Real-time update:', payload);
          router.refresh(); // Refresh the page when new data arrives
        });

        // Perform initial sync
        await syncAllAccounts();
      } catch (error) {
        console.error('Failed to set up sync:', error);
      }
    };

    setupSync();

    return () => {
      if (unsubscribe) unsubscribe();
      cleanupEmailSyncAction().catch(console.error);
    };
  }, [userId]);

  return {
    syncing,
    lastSyncTime,
    syncAllAccounts
  };
}