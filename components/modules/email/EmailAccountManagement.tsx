// /components/modules/email/EmailAccountManagement.tsx
import { useState, useEffect } from 'react';
import { AlertCircle, Mail, Plus, Trash2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EmailProviderFactory, ProviderType } from '@/services/email/providers/ProviderFactory';
import { useToast } from '@/components/ui/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getEmailAccounts, removeEmailAccount, triggerAccountSync } from '@/app/actions/emailActions';
import { formatDistanceToNow } from 'date-fns';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Define missing types
type SyncFrequency = 'hourly' | 'daily' | 'weekly';

type EmailAccount = {
  id: string;
  user_id: string;
  provider: string;
  email_address: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_sync?: string;
  sync_status?: 'syncing' | 'error' | 'success';
  sync_frequency?: SyncFrequency;
};

type SyncStatus = {
  accountId: string;
  status: 'syncing' | 'error' | 'success';
  lastSync: Date | null;
};

type EmailSyncStatus = {
  id: string;
  account_id: string;
  status: 'syncing' | 'error' | 'success';
  last_sync: string | null;
};

// Client Component
export default function EmailAccountManagement() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatuses, setSyncStatuses] = useState<Map<string, SyncStatus>>(new Map());
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const subscription = supabase
      .channel('sync-status')
      .on<EmailSyncStatus>(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'email_sync_status' 
        },
        (payload: RealtimePostgresChangesPayload<EmailSyncStatus>) => {
          setSyncStatuses(current => {
            const newMap = new Map(current);
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              if (payload.new && payload.new.account_id) {  // Add this check
                newMap.set(payload.new.account_id, {
                  accountId: payload.new.account_id,
                  status: payload.new.status,
                  lastSync: payload.new.last_sync ? new Date(payload.new.last_sync) : null
                });
              }
            } else if (payload.eventType === 'DELETE' && payload.old && payload.old.account_id) {  // Add this check
              newMap.delete(payload.old.account_id);
            }
            return newMap;
          });
        }
      )
      .subscribe();
  
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);
  

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const fetchedAccounts = await getEmailAccounts();
        setAccounts(fetchedAccounts);
        
        const statuses = new Map<string, SyncStatus>();
        fetchedAccounts.forEach(account => {
          statuses.set(account.id, {
            accountId: account.id,
            status: account.sync_status || 'success',
            lastSync: account.last_sync ? new Date(account.last_sync) : null
          });
        });
        setSyncStatuses(statuses);
      } catch (err) {
        console.error('Failed to fetch accounts:', err);
        setError('Failed to load email accounts');
      }
    };
  
    fetchAccounts();
  }, []);

  const handleAddAccount = async (provider: ProviderType) => {
    setLoading(true);
    setError(null);
    try {
      const providerInstance = EmailProviderFactory.getProvider(provider, {
        clientId: provider === 'gmail' 
          ? process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID! 
          : process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID!,
        clientSecret: provider === 'gmail'
          ? process.env.GMAIL_CLIENT_SECRET!
          : process.env.MICROSOFT_CLIENT_SECRET!,
        redirectUri: `${window.location.origin}/auth/callback`,
        scopes: provider === 'gmail' 
          ? ['https://mail.google.com/'] 
          : ['Mail.Read', 'Mail.Send']
      });

      const authUrl = providerInstance.getAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      setError(`Failed to initiate ${provider} authentication`);
      console.error(`${provider} auth error:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccount = async (accountId: string) => {
    setLoading(true);
    setError(null);
    try {
      await removeEmailAccount(accountId);
      setAccounts(accounts.filter(account => account.id !== accountId));
      setSyncStatuses(current => {
        const newMap = new Map(current);
        newMap.delete(accountId);
        return newMap;
      });
      toast({
        title: "Account Removed",
        description: "The email account has been successfully removed.",
      });
    } catch (err) {
      setError('Failed to remove email account');
      console.error('Remove account error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrySync = async (accountId: string) => {
    try {
      setSyncStatuses(current => {
        const newMap = new Map(current);
        const status = newMap.get(accountId);
        if (status) {
          newMap.set(accountId, {
            ...status,
            status: 'syncing'
          });
        }
        return newMap;
      });
  
      await triggerAccountSync(accountId);
      
      toast({
        title: "Sync Started",
        description: "Email synchronization has been initiated.",
      });
    } catch (err) {
      console.error('Sync retry failed:', err);
      toast({
        title: "Sync Failed",
        description: "Failed to start email synchronization.",
        variant: "destructive"
      });
  
      setSyncStatuses(current => {
        const newMap = new Map(current);
        const status = newMap.get(accountId);
        if (status) {
          newMap.set(accountId, {
            ...status,
            status: 'error'
          });
        }
        return newMap;
      });
    }
  };

  const getSyncStatusBadge = (accountId: string) => {
    const status = syncStatuses.get(accountId);
    if (!status) return null;

    let badgeProps: {
      variant: 'default' | 'destructive' | 'secondary';
      className: string;
      children: string;
    } = {
      variant: 'default',
      className: '',
      children: 'Unknown'
    };

    switch (status.status) {
      case 'syncing':
        badgeProps = {
          variant: 'default',
          className: 'animate-pulse',
          children: 'Syncing...'
        };
        break;
      case 'error':
        badgeProps = {
          variant: 'destructive',
          className: '',
          children: 'Sync Error'
        };
        break;
      case 'success':
        badgeProps = {
          variant: 'secondary',
          className: '',
          children: 'Synced'
        };
        break;
    }

    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge {...badgeProps} />
        </TooltipTrigger>
        <TooltipContent>
          {status.lastSync 
            ? `Last synced ${formatDistanceToNow(status.lastSync, { addSuffix: true })}` 
            : 'Never synced'}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Accounts</CardTitle>
              <CardDescription>
                Manage your connected email accounts
              </CardDescription>
            </div>
            <Tooltip>
              <TooltipTrigger>
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
              </TooltipTrigger>
              <TooltipContent>
                {isOnline ? 'Connected' : 'Offline'}
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              {accounts.map((account) => (
                <div 
                  key={account.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{account.email_address}</p>
                      <p className="text-sm text-gray-500">{account.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getSyncStatusBadge(account.id)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRetrySync(account.id)}
                      disabled={loading || !isOnline || syncStatuses.get(account.id)?.status === 'syncing'}
                    >
                      <RefreshCw className={`h-4 w-4 ${syncStatuses.get(account.id)?.status === 'syncing' ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAccount(account.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="space-y-2 mt-4">
                <Button
                  className="w-full"
                  onClick={() => handleAddAccount('gmail')}
                  disabled={loading || !isOnline}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Gmail Account
                </Button>
                <Button
                  className="w-full"
                  onClick={() => handleAddAccount('outlook')}
                  disabled={loading || !isOnline}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Outlook Account
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}