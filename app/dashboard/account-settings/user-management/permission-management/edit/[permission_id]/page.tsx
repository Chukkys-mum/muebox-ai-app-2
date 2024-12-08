// /app/dashboard/user-management/permission-management/edit/[role_id]/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNameValidation } from '@/hooks/useNameValidation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProductWithPrices, SubscriptionWithProduct, UserDetails } from '@/types/types';
import DashboardLayout from '@/components/layout';
import { cn } from "@/lib/utils";

interface Props {
  user: User | null | undefined;
  userDetails: UserDetails | null;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
}

const permissionCategories = [
  'admin',
  'super_admin',
  'account',
  'account_admin',
  'analytics_dashboard',
  'billing',
  'chat',
  'crm',
  'file_management',
  'knowledge_bases',
  'permission',
  'personality_profiles',
  'personalitys',
  'pim',
  'projects',
  'teams',
  'users',
];

const generalPermissions = permissionCategories.filter(
  category => !['super_admin', 'account_admin'].includes(category)
);

export default function EditPermissionScheme() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient();
  const permissionId = params.permission_id as string;

  // States
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [products, setProducts] = useState<ProductWithPrices[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionWithProduct | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'administrator'>('general');
  const [permissionSchemeName, setPermissionSchemeName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAccountAdmin, setIsAccountAdmin] = useState(false);
  const [status, setStatus] = useState('active');
  const [nameErrorMessage, setNameErrorMessage] = useState('');
  const [permissionError, setPermissionError] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Name validation hook
  const { validateName, isValidating } = useNameValidation({
    tableName: 'permission_schemes',
    minSimilarity: 0.8,
    customErrorMessage: 'A permission scheme with this name already exists',
    customWarningMessage: 'Similar permission scheme exists: "{name}"'
  });

  // Helper function for checkbox styling
  const getCheckboxClassName = (isChecked: boolean) => cn(
    "h-4 w-4 rounded-sm transition-colors",
    "border-input ring-offset-background",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
    "dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600",
    "dark:data-[state=checked]:bg-zinc-50 dark:data-[state=checked]:border-zinc-50"
  );

  // Fetch user and permission scheme details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('permission_schemes')
          .select('*')
          .eq('id', permissionId)
          .single();

        console.log('Fetched data:', data);

        if (error) {
          console.error('Error:', error);
          return;
        }

        if (data) {
          setPermissionSchemeName(data.name || '');
          setDescription(data.description || '');
          setIsSuperAdmin(!!data.is_super_admin);
          setIsAccountAdmin(!!data.is_account_admin);
          setStatus(data.status || 'active');

          const formattedPermissions = generalPermissions.reduce((acc, category) => {
            acc[category] = {
              create: data.permissions?.[category]?.create ?? false,
              read: data.permissions?.[category]?.read ?? false,
              update: data.permissions?.[category]?.update ?? false,
              delete: data.permissions?.[category]?.delete ?? false,
            };
            return acc;
          }, {} as Record<string, Record<string, boolean>>);

          console.log('Formatted permissions:', formattedPermissions);
          setPermissions(formattedPermissions);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [permissionId]);

  const handleCheckboxChange = (category: string, action: 'create' | 'read' | 'update' | 'delete') => {
    console.log(`Checkbox change triggered for: ${category}-${action}`);
    console.log('Current value:', permissions[category]?.[action]);
    
    setPermissions(prevPermissions => {
      const newValue = !prevPermissions[category]?.[action];
      console.log('Setting new value to:', newValue);
      
      const newPermissions = {
        ...prevPermissions,
        [category]: {
          ...prevPermissions[category],
          [action]: newValue,
        },
      };
      
      console.log('New permissions state:', newPermissions);
      return newPermissions;
    });
  };

  const handleSuperAdminChange = (checked: boolean) => {
    setIsSuperAdmin(checked);
    if (checked) {
      setIsAccountAdmin(false);
      const newPermissions = permissionCategories.reduce((acc, category) => {
        acc[category] = { create: true, read: true, update: true, delete: true };
        return acc;
      }, {} as Record<string, Record<string, boolean>>);
      setPermissions(newPermissions);
    }
  };

  const handleAccountAdminChange = (checked: boolean) => {
    setIsAccountAdmin(checked);
    if (checked) {
      setIsSuperAdmin(false);
      const newPermissions = permissionCategories.reduce((acc, category) => {
        acc[category] = {
          create: true,
          read: true,
          update: true,
          delete: category === 'account' ? false : true
        };
        return acc;
      }, {} as Record<string, Record<string, boolean>>);
      setPermissions(newPermissions);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSaveError(false);
    setNameErrorMessage('');
    
    try {
      if (!permissionSchemeName.trim()) {
        setNameErrorMessage('Permission scheme name is required.');
        setLoading(false);
        return;
      }

      const isPermissionSelected = Object.values(permissions).some(categoryPermissions =>
        Object.values(categoryPermissions).some(value => value)
      );

      if (!isPermissionSelected) {
        setPermissionError(true);
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('permission_schemes')
        .update({
          name: permissionSchemeName.trim(),
          description: description.trim(),
          permissions,
          is_super_admin: isSuperAdmin,
          is_account_admin: isAccountAdmin,
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', permissionId);

      if (updateError) throw updateError;

      router.push('/dashboard/user-management/permission-management');
      
    } catch (error) {
      console.error('Error updating permission scheme:', error);
      setSaveError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Loading..."
        description="Loading permission scheme details..."
        user={user}
        userDetails={userDetails}
        products={products}
        subscription={subscription}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-foreground">
              Loading permission scheme...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Edit Permission Scheme"
      description="Modify access controls for different features."
      user={user}
      userDetails={userDetails}
      products={products}
      subscription={subscription}
    >
      <div className="p-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Edit Permission Scheme</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Update the permission scheme settings and access controls.
                </p>
              </div>

              {saveError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    An error occurred while saving the permission scheme. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-foreground">Permission Scheme Name</Label>
                  <Input
                    id="name"
                    value={permissionSchemeName}
                    onChange={(e) => setPermissionSchemeName(e.target.value)}
                    className={cn(
                      "bg-background text-foreground",
                      nameErrorMessage ? 'border-red-500' : 'border-input'
                    )}
                  />
                  {nameErrorMessage && (
                    <p className="text-sm text-red-500 mt-1">{nameErrorMessage}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description" className="text-foreground">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="bg-background text-foreground border-input"
                  />
                </div>

                <Tabs 
                  value={activeTab} 
                  onValueChange={(value: string) => setActiveTab(value as 'general' | 'administrator')}
                  className="w-full"
                >
                  <TabsList>
                    <TabsTrigger value="general">General Permissions</TabsTrigger>
                    <TabsTrigger value="administrator">Administrator Access</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4">
                    {permissionError && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          Please select at least one permission.
                        </AlertDescription>
                      </Alert>
                    )}

                    {generalPermissions.map((category) => (
                      <div key={category} className="border border-input rounded-lg p-4 bg-background">
                        <h3 className="font-medium mb-2 capitalize text-foreground">
                          {category.replace(/_/g, ' ')}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {['create', 'read', 'update', 'delete'].map((action) => (
                            <div key={`${category}-${action}`} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${category}-${action}`}
                                checked={permissions[category]?.[action] || false}
                                onCheckedChange={() => handleCheckboxChange(category, action as 'create' | 'read' | 'update' | 'delete')}
                                className={getCheckboxClassName(!!permissions[category]?.[action])}
                              />
                              <Label 
                                htmlFor={`${category}-${action}`} 
                                className="capitalize text-foreground"
                              >
                                {action}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="administrator" className="space-y-4">
                    <div className="border border-input rounded-lg p-4 bg-background">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="super-admin"
                            checked={isSuperAdmin}
                            onCheckedChange={handleSuperAdminChange}
                            className={getCheckboxClassName(isSuperAdmin)}
                          />
                          <Label htmlFor="super-admin" className="text-foreground">
                            Super Administrator
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="account-admin"
                            checked={isAccountAdmin}
                            onCheckedChange={handleAccountAdminChange}
                            className={getCheckboxClassName(isAccountAdmin)}
                          />
                          <Label htmlFor="account-admin" className="text-foreground">
                            Account Administrator
                          </Label>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/user-management/permission-management')}
                  disabled={loading}
                  className="bg-background"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}