// /app/dashboard/user-management/permission-management/view/[permission_id]/page.tsx

'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DashboardWrapper } from '@/components/layout/dashboard-wrapper';

const permissionCategories = [
  "admin",
  "super_admin",
  "account",
  "account_admin",
  "analytics_dashboard",
  "billing",
  "chat",
  "crm",
  "file_management",
  "knowledge_bases",
  "permission",
  "personality_profiles",
  "personalitys",
  "pim",
  "projects",
  "teams",
  "users",
];

const generalPermissions = permissionCategories.filter(
  category => !['super_admin', 'account_admin'].includes(category)
);

export default function ViewPermissionScheme() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient();
  const permissionId = params.permission_id as string;

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionScheme, setPermissionScheme] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'administrator'>('general');

  // Helper function for checkbox styling
  const getCheckboxClassName = (isChecked: boolean) => cn(
    "h-4 w-4 rounded-sm transition-colors cursor-not-allowed opacity-60",
    "border-input ring-offset-background",
    "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
    "dark:border-zinc-700 dark:bg-zinc-900",
    "dark:data-[state=checked]:bg-zinc-50 dark:data-[state=checked]:border-zinc-50"
  );

  // Fetch permission scheme details
  useEffect(() => {
    const fetchPermissionScheme = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("permission_schemes")
          .select("*")
          .eq("id", permissionId)
          .single();

        if (error) throw error;

        if (data) {
          setPermissionScheme(data);
          console.log('Loaded permission scheme:', data);
        }
      } catch (error: any) {
        console.error('Error fetching permission scheme:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissionScheme();
  }, [permissionId, supabase]);

  if (loading) {
    return (
      <DashboardWrapper
        title="Loading..."
        description="Loading permission scheme details"
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-foreground">Loading permission scheme...</p>
          </div>
        </div>
      </DashboardWrapper>
    );
  }

  if (error || !permissionScheme) {
    return (
      <DashboardWrapper
        title="Error"
        description="Error loading permission scheme"
      >
        <div className="p-6">
          <Card className="p-6">
            <h1 className="text-xl font-extrabold text-foreground md:text-3xl mb-6">
              {error || 'Permission scheme not found'}
            </h1>
            <Button
              onClick={() => router.push('/dashboard/user-management/permission-management')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Back to Permission Management
            </Button>
          </Card>
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper
      title="View Permission Scheme"
      description="View permission scheme details"
    >
      <div className="p-6">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground">View Permission Scheme</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  View permission scheme settings and access controls.
                </p>
              </div>
              <Button
                onClick={() => router.push(`/dashboard/user-management/permission-management/edit/${permissionId}`)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Edit Scheme
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-foreground font-semibold">Name</Label>
                <p className="mt-1 text-foreground">{permissionScheme.name}</p>
              </div>

              <div>
                <Label className="text-foreground font-semibold">Description</Label>
                <p className="mt-1 text-foreground">
                  {permissionScheme.description || 'No description provided'}
                </p>
              </div>

              <div>
                <Label className="text-foreground font-semibold">Status</Label>
                <p className="mt-1 text-foreground capitalize">{permissionScheme.status}</p>
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
                              checked={permissionScheme.permissions?.[category]?.[action] || false}
                              disabled
                              className={getCheckboxClassName(!!permissionScheme.permissions?.[category]?.[action])}
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
                          checked={permissionScheme.is_super_admin || false}
                          disabled
                          className={getCheckboxClassName(!!permissionScheme.is_super_admin)}
                        />
                        <Label htmlFor="super-admin" className="text-foreground">
                          Super Administrator
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="account-admin"
                          checked={permissionScheme.is_account_admin || false}
                          disabled
                          className={getCheckboxClassName(!!permissionScheme.is_account_admin)}
                        />
                        <Label htmlFor="account-admin" className="text-foreground">
                          Account Administrator
                        </Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-4">
                <Button
                  onClick={() => router.push('/dashboard/user-management/permission-management')}
                  variant="outline"
                  className="bg-background"
                >
                  Back to Permission Management
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardWrapper>
  );
}