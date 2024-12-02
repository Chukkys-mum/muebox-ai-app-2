// hooks/useEmailSync.ts

import { useState, useEffect } from 'react';
import { emailSyncService } from '@/services/email/EmailSyncService';
import { createClient } from '@/utils/supabase/client';
import { toast } from '@/components/ui/use-toast';

export function useEmailSync(userId: string) {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const supabase = createClient();

  // Function to sync all email accounts for a user
  const syncAllAccounts = async () => {
    if (syncing) return;
    
    setSyncing(true);
    try {
      // Get all email accounts for user
      const { data: accounts, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;

      // Sync each account
      await Promise.all(
        accounts.map(account => 
          emailSyncService.syncEmails(account.id, userId)
            .catch(error => {
              console.error(`Failed to sync account ${account.id}:`, error);
              toast({
                title: "Sync Failed",
                description: `Failed to sync ${account.email_address}`,
                variant: "destructive",
              });
            })
        )
      );

      setLastSyncTime(new Date());
      toast({
        title: "Sync Complete",
        description: "Your emails have been synchronized",
      });
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

  // Set up real-time sync when component mounts
  useEffect(() => {
    const cleanup = emailSyncService.setupRealTimeSync(userId);
    
    // Sync emails initially
    syncAllAccounts();

    // Set up periodic sync every 5 minutes
    const syncInterval = setInterval(syncAllAccounts, 5 * 60 * 1000);

    // Cleanup on unmount
    return () => {
      cleanup();
      clearInterval(syncInterval);
    };
  }, [userId]);

  // Subscribe to email account changes
  useEffect(() => {
    const subscription = supabase
      .channel('email-accounts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_accounts',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // New account added, sync it
            emailSyncService.syncEmails(payload.new.id, userId);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return {
    syncing,
    lastSyncTime,
    syncAllAccounts
  };
}