// /app/dashboard/user-management/permission-management/new/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import dynamic from 'next/dynamic';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// At the top of your /app/dashboard/user-management/permission-management/new/page.tsx file
import { useNameValidation } from '@/hooks/useNameValidation';

// Dynamically import DashboardLayout with SSR disabled
import { DashboardWrapper } from '@/components/layout/dashboard-wrapper';


type PermissionAction = 'create' | 'read' | 'update' | 'delete';

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

const initializePermissions = () => {
return permissionCategories.reduce((acc, category) => {
  const defaultPermissions = { create: false, read: false, update: false, delete: false };
  acc[category] = defaultPermissions;
  return acc;
}, {} as Record<string, { create: boolean; read: boolean; update: boolean; delete: boolean }>);
};

const NewPermissionScheme = () => {
const [loading, setLoading] = useState(false);
const [activeTab, setActiveTab] = useState<'general' | 'administrator'>('general');
const [permissionSchemeName, setPermissionSchemeName] = useState("");
const [permissions, setPermissions] = useState(initializePermissions);
const [isSuperAdmin, setIsSuperAdmin] = useState(false);
const [isAccountAdmin, setIsAccountAdmin] = useState(false);
const [nameErrorMessage, setNameErrorMessage] = useState<string>("");
const [permissionError, setPermissionError] = useState(false);
const [saveError, setSaveError] = useState(false);
const [description, setDescription] = useState("");
const router = useRouter();
const supabase = createClientComponentClient();
const { validateName, isValidating } = useNameValidation({
  tableName: 'permission_schemes',
  minSimilarity: 0.8,
  customErrorMessage: 'A permission scheme with this name already exists',
  customWarningMessage: 'Similar permission scheme exists: "{name}"',
  enableSimilarCheck: true
});
const [nameWarnings, setNameWarnings] = useState<string[]>([]);


// Effect to clear error message when name changes
useEffect(() => {
  setNameErrorMessage("");
}, [permissionSchemeName]);

// Form reset function
const resetForm = () => {
  setPermissionSchemeName("");
  setDescription("");
  setPermissions(initializePermissions());
  setPermissionError(false);
  setSaveError(false);
  setNameErrorMessage("");
  setIsSuperAdmin(false);
  setIsAccountAdmin(false);
};

// Debounced name change handler
const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const newName = e.target.value;
  setPermissionSchemeName(newName);
  
  if (newName.trim()) {
    const validation = await validateName(newName);
    setNameErrorMessage(validation.errorMessage);
    setNameWarnings(validation.warnings);
  } else {
    setNameErrorMessage('');
    setNameWarnings([]);
  }
};

const handleCheckboxChange = (category: string, action: PermissionAction) => {
  setPermissions((prevPermissions) => ({
    ...prevPermissions,
    [category]: {
      ...prevPermissions[category],
      [action]: !prevPermissions[category][action],
    },
  }));
};

const handleSuperAdminChange = (checked: boolean) => {
  setIsSuperAdmin(checked);
  if (checked) {
    setIsAccountAdmin(false);
    // Set all permissions to true
    const newPermissions = permissionCategories.reduce((acc, category) => {
      acc[category] = { create: true, read: true, update: true, delete: true };
      return acc;
    }, {} as Record<string, { create: boolean; read: boolean; update: boolean; delete: boolean }>);
    setPermissions(newPermissions);
  } else {
    setPermissions(initializePermissions());
  }
};

const handleAccountAdminChange = (checked: boolean) => {
  setIsAccountAdmin(checked);
  if (checked) {
    setIsSuperAdmin(false);
    // Set all permissions to true except account delete
    const newPermissions = permissionCategories.reduce((acc, category) => {
      acc[category] = {
        create: true,
        read: true,
        update: true,
        delete: category === 'account' ? false : true
      };
      return acc;
    }, {} as Record<string, { create: boolean; read: boolean; update: boolean; delete: boolean }>);
    setPermissions(newPermissions);
  } else {
    setPermissions(initializePermissions());
  }
};

// Handle submit function
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setSaveError(false);
  setNameErrorMessage("");
  
  try {
    // Validate permission scheme name
    if (!permissionSchemeName.trim()) {
      setNameErrorMessage("Permission scheme name is required.");
      setLoading(false);
      return;
    }

    // Validate permissions (keeping this from original version)
    const isPermissionSelected = Object.values(permissions).some((categoryPermissions) =>
      Object.values(categoryPermissions).some((value) => value)
    );
    if (!isPermissionSelected) {
      setPermissionError(true);
      setLoading(false);
      return;
    }

    // Final name validation before submit
    const validation = await validateName(permissionSchemeName);
    if (!validation.isValid) {
      setNameErrorMessage(validation.errorMessage);
      setLoading(false);
      return;
    }

    // Optional: Check if there are warnings and if you want to confirm
    if (nameWarnings.length > 0) {
      const confirmSubmit = window.confirm(
        "There are similar permission schemes. Are you sure you want to continue?"
      );
      if (!confirmSubmit) {
        setLoading(false);
        return;
      }
    }

    // Prepare data for submission
    const permissionSchemeData = {
      name: permissionSchemeName.trim(),
      description: description.trim(),
      permissions,
      is_super_admin: isSuperAdmin,
      is_account_admin: isAccountAdmin,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert new permission scheme
    const { error: insertError } = await supabase
      .from("permission_schemes")
      .insert(permissionSchemeData);

    if (insertError) {
      if (insertError.code === '23505') { // PostgreSQL unique violation
        setNameErrorMessage("A permission scheme with this name already exists.");
        return;
      }
      throw insertError;
    }

    // Success - redirect to permission management page
    router.push("/dashboard/user-management/permission-management");
    
  } catch (error) {
    console.error("Error creating permission scheme:", error);
    setSaveError(true);
  } finally {
    setLoading(false);
  }
};

if (loading) {
  return (
    <DashboardWrapper
      title="Loading..."
      description="Creating permission scheme..."
    >
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300">Creating permission scheme...</p>
        </div>
      </div>
    </DashboardWrapper>
  );
}

return (
  <DashboardWrapper
    title="Create New Permission Scheme"
    description="Define access controls for different features."
  >
    <div className="p-6">
      <Card className="p-6 dark:border-zinc-800">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">
          Create New Permission Scheme
        </h1>
        {saveError && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            Error saving permission scheme. Please try again.
          </div>
        )}
        <form onSubmit={handleSubmit}>
        <div>
          <label className="mb-3 block text-sm font-semibold text-foreground dark:text-white">
            Permission Scheme Name
          </label>
          <input
            type="text"
            placeholder="Enter permission scheme name"
            value={permissionSchemeName}
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
          <div>
            <label className="mb-3 block text-sm font-semibold text-foreground dark:text-white">
              Description
            </label>
            <textarea
              placeholder="Enter permission scheme description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white p-3 outline-none shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              rows={3}
            />
          </div>

          {/* Permissions Tabs */}
          <div>
            <div className="flex space-x-4 mb-4 border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'general'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                General
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('administrator')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'administrator'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Administrator
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-4">
              {activeTab === 'administrator' ? (
                <div className="space-y-6">
                  {/* Super Admin Option */}
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={isSuperAdmin}
                        onChange={(e) => handleSuperAdminChange(e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <div>
                        <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                          Super Administrator
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Full access to all features and permissions across the entire system.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Account Admin Option */}
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={isAccountAdmin}
                        onChange={(e) => handleAccountAdminChange(e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <div>
                        <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                          Account Administrator
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Full access to all features except account deletion capability.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {generalPermissions.map((category) => (
                    <div key={category} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                        {category.split('_').map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {["create", "read", "update", "delete"].map((action) => (
                          <label key={action} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions[category]?.[action as PermissionAction] || false}
                              onChange={() =>
                                handleCheckboxChange(
                                  category,
                                  action as PermissionAction
                                )
                              }
                              disabled={isSuperAdmin || (isAccountAdmin && category === 'account' && action === 'delete')}
                              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:opacity-50"
                            />
                            <span className="capitalize text-sm text-gray-700 dark:text-gray-300">
                              {action}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {permissionError && (
              <p className="text-red-500 text-sm mt-1">
                At least one permission must be selected for any category.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/user-management/permission-management")}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-white hover:bg-primary/90 dark:bg-white dark:text-black dark:hover:bg-gray-300"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Permission Scheme"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  </DashboardWrapper>
);
};

export default NewPermissionScheme;