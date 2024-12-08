// app/dashboard/user-management/role-management/new/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import dynamic from 'next/dynamic';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNameValidation } from '@/hooks/useNameValidation';

// Dynamically import DashboardLayout with SSR disabled
import { DashboardWrapper } from '@/components/layout/dashboard-wrapper';

interface PermissionScheme {
  id: string;
  name: string;
}

interface RoleData {
  name: string;
  description: string;
  permission_scheme_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const NewRole = () => {
  // Form state
  const [roleName, setRoleName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [permissionSchemeId, setPermissionSchemeId] = useState<string>("");
  const [status, setStatus] = useState<string>("active");
  const [availableSchemes, setAvailableSchemes] = useState<PermissionScheme[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<boolean>(false);
  const [nameErrorMessage, setNameErrorMessage] = useState<string>("");
  const [nameWarnings, setNameWarnings] = useState<string[]>([]);

  // Hooks
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { validateName, isValidating } = useNameValidation({
    tableName: 'roles',
    minSimilarity: 0.8,
    customErrorMessage: 'A role with this name already exists',
    customWarningMessage: 'Similar role exists: "{name}"',
    enableSimilarCheck: true
  });

  // Effect to clear error message when name changes
  useEffect(() => {
    setNameErrorMessage("");
  }, [roleName]);

  // Effect to fetch available permission schemes
  useEffect(() => {
    const fetchPermissionSchemes = async () => {
      try {
        const { data, error } = await supabase
          .from('permission_schemes')
          .select('id, name')
          .eq('status', 'active')
          .order('name');

        if (error) throw error;
        setAvailableSchemes(data || []);
      } catch (error) {
        console.error('Error fetching permission schemes:', error);
      }
    };

    fetchPermissionSchemes();
  }, [supabase]);

  // Form reset function
  const resetForm = () => {
    setRoleName("");
    setDescription("");
    setPermissionSchemeId("");
    setStatus("active");
    setSaveError(false);
    setNameErrorMessage("");
    setNameWarnings([]);
  };

  // Debounced name change handler
  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setRoleName(newName);
    
    if (newName.trim()) {
      const validation = await validateName(newName);
      setNameErrorMessage(validation.errorMessage);
      setNameWarnings(validation.warnings);
    } else {
      setNameErrorMessage('');
      setNameWarnings([]);
    }
  };

  // Handle submit function
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSaveError(false);
    setNameErrorMessage("");
    
    try {
      // Validate role name
      if (!roleName.trim()) {
        setNameErrorMessage("Role name is required.");
        setLoading(false);
        return;
      }

      // Validate permission scheme selection
      if (!permissionSchemeId) {
        setLoading(false);
        setSaveError(true);
        return;
      }

      // Final name validation before submit
      const validation = await validateName(roleName);
      if (!validation.isValid) {
        setNameErrorMessage(validation.errorMessage);
        setLoading(false);
        return;
      }

      // Optional: Check if there are warnings and if you want to confirm
      if (nameWarnings.length > 0) {
        const confirmSubmit = window.confirm(
          "There are similar roles. Are you sure you want to continue?"
        );
        if (!confirmSubmit) {
          setLoading(false);
          return;
        }
      }

      // Prepare data for submission
      const roleData: RoleData = {
        name: roleName.trim(),
        description: description.trim(),
        permission_scheme_id: permissionSchemeId,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert new role
      const { error: insertError } = await supabase
        .from("roles")
        .insert(roleData);

      if (insertError) {
        if (insertError.code === '23505') { // PostgreSQL unique violation
          setNameErrorMessage("A role with this name already exists.");
          return;
        }
        throw insertError;
      }

      // Success - redirect to role management page
      router.push("/dashboard/user-management/role-management");
      
    } catch (error) {
      console.error("Error creating role:", error);
      setSaveError(true);
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <DashboardWrapper
        title="Loading..."
        description="Creating role..."
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300">Creating role...</p>
          </div>
        </div>
      </DashboardWrapper>
    );
  }

  // Main render
  return (
    <DashboardWrapper
      title="Create New Role"
      description="Define a new role and assign permissions."
    >
      <div className="p-6">
        <Card className="p-6 dark:border-zinc-800">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">
            Create New Role
          </h1>
          {saveError && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              Error saving role. Please try again.
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {/* Role Name Field */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-semibold text-foreground dark:text-white">
                Role Name
              </label>
              <input
                type="text"
                placeholder="Enter role name"
                value={roleName}
                onChange={handleNameChange}
                required
                className="w-full rounded-md border border-gray-300 bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white p-3 outline-none shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              />
              {nameErrorMessage && (
                <p className="text-red-500 text-sm mt-1">
                  {nameErrorMessage}
                </p>
              )}
              {nameWarnings.length > 0 && (
                <div className="mt-2">
                  {nameWarnings.map((warning, index) => (
                    <p key={index} className="text-yellow-500 text-sm flex items-center gap-2">
                      <span role="img" aria-label="warning">⚠️</span>
                      {warning}
                    </p>
                  ))}
                </div>
              )}
              {isValidating && (
                <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Checking name availability...
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-semibold text-foreground dark:text-white">
                Description
              </label>
              <textarea
                placeholder="Enter role description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white p-3 outline-none shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                rows={3}
              />
            </div>

            {/* Permission Scheme Selection */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-semibold text-foreground dark:text-white">
                Permission Scheme
              </label>
              <select
                value={permissionSchemeId}
                onChange={(e) => setPermissionSchemeId(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white p-3 outline-none shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              >
                <option value="">Select a permission scheme</option>
                {availableSchemes.map((scheme) => (
                  <option key={scheme.id} value={scheme.id}>
                    {scheme.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selection */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-semibold text-foreground dark:text-white">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white p-3 outline-none shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/user-management/role-management")}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-white hover:bg-primary/90 dark:bg-white dark:text-black dark:hover:bg-gray-300"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Role"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardWrapper>
  );
};

export default NewRole;