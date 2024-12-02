// /components/modules/email/EmailAccountManagement.tsx

import { useState } from 'react';
import { AlertCircle, Mail, Plus, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type EmailAccount = {
  id: string;
  provider: string;
  email_address: string;
  status: string;
  created_at: string;
}

export default function EmailAccountManagement() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddGmail = async () => {
    setLoading(true);
    setError(null);
    try {
      // OAuth redirect URL should be configured in the Google Cloud Console
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      // Google OAuth configuration
      const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${redirectUrl}` +
        `&response_type=code` +
        `&scope=https://mail.google.com/ email profile` +
        `&access_type=offline` +
        `&prompt=consent`;

      // Redirect to Google OAuth
      window.location.href = googleOAuthUrl;
    } catch (err) {
      setError('Failed to initiate Gmail authentication');
      console.error('Gmail auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOutlook = async () => {
    setLoading(true);
    setError(null);
    try {
      // OAuth redirect URL should be configured in the Microsoft Azure Portal
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      // Microsoft OAuth configuration
      const microsoftOAuthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID}` +
        `&redirect_uri=${redirectUrl}` +
        `&response_type=code` +
        `&scope=Mail.Read Mail.Send User.Read` +
        `&response_mode=query`;

      // Redirect to Microsoft OAuth
      window.location.href = microsoftOAuthUrl;
    } catch (err) {
      setError('Failed to initiate Outlook authentication');
      console.error('Outlook auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccount = async (accountId: string) => {
    setLoading(true);
    setError(null);
    try {
      // API call to remove account
      const response = await fetch(`/api/email-accounts/${accountId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to remove account');
      
      // Update local state
      setAccounts(accounts.filter(account => account.id !== accountId));
    } catch (err) {
      setError('Failed to remove email account');
      console.error('Remove account error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Email Accounts</CardTitle>
          <CardDescription>
            Manage your connected email accounts
          </CardDescription>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAccount(account.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="space-y-2 mt-4">
                <Button
                  className="w-full"
                  onClick={handleAddGmail}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Gmail Account
                </Button>
                <Button
                  className="w-full"
                  onClick={handleAddOutlook}
                  disabled={loading}
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