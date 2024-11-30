// /components/dashboard/settings/LLMConfig.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { toast } from '@/components/ui/use-toast';
import { llmProviders } from '@/services/llm/providers';

interface LLMConfigProps {
  userId: string;
}

export function LLMConfig({ userId }: LLMConfigProps) {
  const [providers, setProviders] = useState<any[]>([]);
  const [userKeys, setUserKeys] = useState<Record<string, string>>({});
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    loadProviders();
    loadUserKeys();
  }, []);

  const loadProviders = async () => {
    const { data, error } = await supabase
      .from('llm_providers')
      .select('*')
      .eq('is_enabled', true);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load LLM providers',
        variant: 'destructive',
      });
      return;
    }

    setProviders(data);
  };

  const loadUserKeys = async () => {
    const { data, error } = await supabase
      .from('user_api_keys')
      .select('provider_id, api_key')
      .eq('user_id', userId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load API keys',
        variant: 'destructive',
      });
      return;
    }

    const keys = Object.fromEntries(
      data.map(({ provider_id, api_key }) => [provider_id, api_key])
    );
    setUserKeys(keys);
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
      // Validate API key
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

      // Save API key
      const { error } = await supabase
        .from('user_api_keys')
        .upsert({
          user_id: userId,
          provider_id: selectedProvider,
          api_key: newApiKey,
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
                  {provider.capabilities.map((cap: string) => (
                    <span
                      key={cap}
                      className="inline-block bg-muted px-2 py-1 rounded-md text-xs mr-1"
                    >
                      {cap}
                    </span>
                  ))}
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