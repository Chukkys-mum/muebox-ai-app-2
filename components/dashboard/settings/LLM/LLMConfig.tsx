// /components/dashboard/settings/LLM/LLMConfig.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/utils/supabase/client';
import { llmProviders } from '@/services/llm/providers';

// Define the correct types based on your actual database structure
interface LLMProvider {
    id: string;
    name: string;
    contact_info: string | null;
    website: string | null;
    created_at: string;
    capabilities?: string[];
    is_enabled?: boolean;
  }

interface UserApiKey {
  id: string;
  llm_id: string;
  user_id: string;
  api_key: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface LLMConfigProps {
  userId: string;
  initialProviders: LLMProvider[];
  initialUserKeys: Array<{
    llm_id: string;
    api_key: string;
  }>;
}

export function LLMConfig({ userId }: LLMConfigProps) {
  const [providers, setProviders] = React.useState<LLMProvider[]>([]);
  const [userKeys, setUserKeys] = React.useState<Record<string, string>>({});
  const [showKeyDialog, setShowKeyDialog] = React.useState(false);
  const [selectedProvider, setSelectedProvider] = React.useState<string | null>(null);
  const [newApiKey, setNewApiKey] = React.useState('');
  const [isValidating, setIsValidating] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    loadProviders();
    loadUserKeys();
  }, []);

  const loadProviders = async () => {
    const { data, error } = await supabase
      .from('llm_providers')
      .select('*');
  
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load LLM providers',
        variant: 'destructive',
      });
      return;
    }
  
    if (data) {
      const providersWithCapabilities: LLMProvider[] = data.map((row: LLMProvider) => ({
        ...row,
        capabilities: row.capabilities || [], // Use existing capabilities or empty array
        is_enabled: row.is_enabled !== undefined ? row.is_enabled : true // Use existing is_enabled or default to true
      }));
      setProviders(providersWithCapabilities);
    }
  };

  const loadUserKeys = async () => {
    const { data, error } = await supabase
      .from('user_api_keys')
      .select('llm_id, api_key')
      .eq('user_id', userId);
  
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load API keys',
        variant: 'destructive',
      });
      return;
    }
  
    if (data) {
      const keys: Record<string, string> = {};
      data.forEach((row: Pick<UserApiKey, 'llm_id' | 'api_key'>) => {
        keys[row.llm_id] = row.api_key;
      });
      setUserKeys(keys);
    }
  };

  const handleAddKey = (providerId: string) => {
    setSelectedProvider(providerId);
    setNewApiKey('');
    setShowKeyDialog(true);
  };

  const handleSaveKey = async () => {
    if (!selectedProvider || !newApiKey.trim()) return;
  
    setIsValidating(true);
    try {
      const provider = llmProviders[selectedProvider];
      const isValid = await provider.validate(newApiKey);
  
      if (!isValid) {
        toast({
          title: 'Invalid API Key',
          description: 'The provided API key is invalid',
          variant: 'destructive',
        });
        return;
      }
  
      const { error } = await supabase
        .from('user_api_keys')
        .upsert({
          llm_id: selectedProvider,
          user_id: userId,
          api_key: newApiKey,
          is_enabled: true
        });
  
      if (error) throw error;
  
      toast({
        title: 'Success',
        description: 'API key saved successfully',
      });
  
      setShowKeyDialog(false);
      loadUserKeys();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save API key',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Capabilities</TableHead>
              <TableHead>API Key</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell className="font-medium">
                  {provider.name}
                </TableCell>
                <TableCell>
                {provider.capabilities?.map((cap) => (
                    <span
                    key={cap}
                    className="inline-block bg-muted px-2 py-1 rounded-md text-xs mr-1"
                    >
                    {cap}
                    </span>
                )) || 'No capabilities'}
                </TableCell>
                <TableCell>
                  {userKeys[provider.id] ? '••••••••' : 'Not configured'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    onClick={() => handleAddKey(provider.id)}
                  >
                    {userKeys[provider.id] ? 'Update' : 'Add'} Key
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <AlertDialog
          open={showKeyDialog}
          onOpenChange={setShowKeyDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {userKeys[selectedProvider!] ? 'Update' : 'Add'} API Key
              </AlertDialogTitle>
              <AlertDialogDescription>
                Enter your API key for {providers.find(p => p.id === selectedProvider)?.name}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="Enter your API key"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSaveKey}
                disabled={isValidating}
              >
                {isValidating ? 'Validating...' : 'Save'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}