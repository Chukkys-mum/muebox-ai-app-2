// /app/dashboard/user-management/role-management/view/[role_id]/page.tsx

'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, History } from "lucide-react";
import { DashboardWrapper } from '@/components/layout/dashboard-wrapper';

interface RoleDetails {
  id: string;
  name: string;
  status: string;
  permission_scheme_id: string;
  created_at: string;
  updated_at: string;
  permission_scheme?: {
    name: string;
    permissions: Record<string, any>;
  };
  users?: {
    id: string;
    full_name: string;
    email: string;
    status: string;
  }[];
}

export default function ViewRole() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient();
  const roleId = params.role_id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleDetails, setRoleDetails] = useState<RoleDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'permissions' | 'users' | 'activity'>('permissions');

  useEffect(() => {
    const fetchRoleDetails = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('roles')
          .select(`
            *,
            permission_scheme:permission_scheme_id (
              name,
              permissions
            ),
            users (
              id,
              full_name,
              email,
              status
            )
          `)
          .eq('id', roleId)
          .single();

        if (error) throw error;
        setRoleDetails(data);
      } catch (error: any) {
        console.error('Error fetching role details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleDetails();
  }, [roleId, supabase]);

  const renderPermissionGrid = (permissions: Record<string, any>) => {
    return Object.entries(permissions).map(([category, actions]) => (
      <div key={category} className="border border-input rounded-lg p-4 bg-background space-y-2">
        <h3 className="font-medium capitalize">{category.replace(/_/g, ' ')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(actions).map(([action, enabled]) => (
            <div key={`${category}-${action}`} className="flex items-center space-x-2">
              <Badge variant={enabled ? 'default' : 'secondary'}>
                {action}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <DashboardWrapper
        title="Loading..."
        description="Loading role details"
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-foreground">Loading role details...</p>
          </div>
        </div>
      </DashboardWrapper>
    );
  }

  if (error || !roleDetails) {
    return (
      <DashboardWrapper
        title="Error"
        description="Error loading role details"
      >
        <div className="p-6">
          <Card className="p-6">
            <h1 className="text-xl font-extrabold text-foreground md:text-3xl mb-6">
              {error || 'Role not found'}
            </h1>
            <Button
              onClick={() => router.push('/dashboard/user-management/roles')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Back to Roles
            </Button>
          </Card>
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper
      title="View Role"
      description="View role details and permissions"
    >
      <div className="p-6">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Role Details</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  View role configuration and assigned users
                </p>
              </div>
              <Button
                onClick={() => router.push(`/dashboard/user-management/roles/edit/${roleId}`)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Edit Role
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-foreground font-semibold">Role Name</Label>
                <p className="mt-1 text-foreground">{roleDetails.name}</p>
              </div>

              <div>
                <Label className="text-foreground font-semibold">Status</Label>
                <Badge 
                  variant={roleDetails.status === 'active' ? 'default' : 'secondary'}
                  className="mt-1"
                >
                  {roleDetails.status}
                </Badge>
              </div>

              <div>
                <Label className="text-foreground font-semibold">Permission Scheme</Label>
                <p className="mt-1 text-foreground">
                  {roleDetails.permission_scheme?.name || 'No permission scheme assigned'}
                </p>
              </div>

              <Tabs 
                value={activeTab} 
                onValueChange={(value: string) => setActiveTab(value as any)}
                className="w-full"
              >
                <TabsList>
                  <TabsTrigger value="permissions" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Permissions
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Users
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="permissions" className="space-y-4">
                  {roleDetails.permission_scheme?.permissions ? (
                    renderPermissionGrid(roleDetails.permission_scheme.permissions)
                  ) : (
                    <p className="text-muted-foreground">No permissions configured</p>
                  )}
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roleDetails.users?.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.full_name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={user.status === 'active' ? 'default' : 'secondary'}
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!roleDetails.users || roleDetails.users.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              No users assigned to this role
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-foreground font-semibold">Created At</Label>
                        <p className="mt-1 text-foreground">
                          {new Date(roleDetails.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-foreground font-semibold">Last Updated</Label>
                        <p className="mt-1 text-foreground">
                          {new Date(roleDetails.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-4">
                <Button
                  onClick={() => router.push('/dashboard/user-management/roles')}
                  variant="outline"
                  className="bg-background"
                >
                  Back to Roles
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardWrapper>
  );
}