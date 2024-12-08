// app/dashboard/user-management/role-management/edit/[role_id]/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { DashboardWrapper } from '@/components/layout/dashboard-wrapper';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNameValidation } from '@/hooks/useNameValidation';
import { cn } from "@/lib/utils";

interface PermissionScheme {
  id: string;
  name: string;
  permissions: any;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permission_scheme_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function EditRole() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient();
  const roleId = params.role_id as string;

  // States
  const [loading, setLoading] = useState(true);
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [permissionSchemeId, setPermissionSchemeId] = useState('');
  const [status, setStatus] = useState('active');
  const [availableSchemes, setAvailableSchemes] = useState<PermissionScheme[]>([]);
  const [nameErrorMessage, setNameErrorMessage] = useState('');
  const [saveError, setSaveError] = useState(false);

  // Update the validation hook usage
  const { validateName, isValidating } = useNameValidation({
    tableName: 'roles',
    minSimilarity: 0.8,
    customErrorMessage: 'A role with this name already exists',
    customWarningMessage: 'Similar role exists: "{name}"',
    enableSimilarCheck: true,
    skipId: roleId
  });

  // Fetch role and permission schemes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch role details
        const { data: role, error: roleError } = await supabase
          .from('roles')
          .select('*')
          .eq('id', roleId)
          .single();

        if (roleError) throw roleError;

        if (role) {
          setRoleName(role.name || '');
          setDescription(role.description || '');
          setPermissionSchemeId(role.permission_scheme_id || '');
          setStatus(role.status || 'active');
        }

        // Fetch available permission schemes
        const { data: schemes, error: schemesError } = await supabase
          .from('permission_schemes')
          .select('id, name, permissions')
          .eq('status', 'active')
          .order('name');

        if (schemesError) throw schemesError;
        setAvailableSchemes(schemes || []);

      } catch (error) {
        console.error('Fetch error:', error);
        setSaveError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roleId, supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSaveError(false);
    setNameErrorMessage('');
    
    try {
      if (!roleName.trim()) {
        setNameErrorMessage('Role name is required.');
        setLoading(false);
        return;
      }

      if (!permissionSchemeId) {
        setSaveError(true);
        setLoading(false);
        return;
      }

      const validation = await validateName(roleName);
      if (!validation.isValid) {
        setNameErrorMessage(validation.errorMessage);
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('roles')
        .update({
          name: roleName.trim(),
          description: description.trim(),
          permission_scheme_id: permissionSchemeId,
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', roleId);

      if (updateError) throw updateError;

      router.push('/dashboard/user-management/role-management');
      
    } catch (error) {
      console.error('Error updating role:', error);
      setSaveError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardWrapper
        title="Loading..."
        description="Loading role details..."
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-foreground">Loading role...</p>
          </div>
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper
      title="Edit Role"
      description="Modify role settings and permissions."
    >
      <div className="p-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Edit Role</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Update the role settings and permissions.
                </p>
              </div>

              {saveError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    An error occurred while saving the role. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="bg-background text-foreground border-input"
                  />
                </div>

                <div>
                  <Label htmlFor="permissionScheme">Permission Scheme</Label>
                  <select
                    id="permissionScheme"
                    value={permissionSchemeId}
                    onChange={(e) => setPermissionSchemeId(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select a permission scheme</option>
                    {availableSchemes.map((scheme) => (
                      <option key={scheme.id} value={scheme.id}>
                        {scheme.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/user-management/role-management')}
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
    </DashboardWrapper>
  );
}