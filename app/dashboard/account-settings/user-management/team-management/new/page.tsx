// app/dashboard/user-management/team-management/new/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import dynamic from 'next/dynamic';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNameValidation } from '@/hooks/useNameValidation';
import { DashboardWrapper } from '@/components/layout/dashboard-wrapper';
interface User {
  id: string;
  email: string;
  full_name: string;
}

interface Role {
  id: string;
  name: string;
}

interface TeamData {
  name: string;
  description: string;
  user_id: string;
  role_id: string;
  entity_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const NewTeam = () => {
  // Form state
  const [teamName, setTeamName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [roleId, setRoleId] = useState<string>("");
  const [status, setStatus] = useState<string>("active");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<boolean>(false);
  const [nameErrorMessage, setNameErrorMessage] = useState<string>("");
  const [nameWarnings, setNameWarnings] = useState<string[]>([]);

  // Hooks
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { validateName, isValidating } = useNameValidation({
    tableName: 'teams',
    minSimilarity: 0.8,
    customErrorMessage: 'A team with this name already exists',
    customWarningMessage: 'Similar team exists: "{name}"',
    enableSimilarCheck: true
  });

  // Effect to clear error message when name changes
  useEffect(() => {
    setNameErrorMessage("");
  }, [teamName]);

  // Effect to fetch available users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, full_name')
          .eq('status', 'active')
          .order('full_name');

        if (error) throw error;
        setAvailableUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [supabase]);

  // Effect to fetch available roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('roles')
          .select('id, name')
          .eq('status', 'active')
          .order('name');

        if (error) throw error;
        setAvailableRoles(data || []);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchRoles();
  }, [supabase]);

  // Form reset function
  const resetForm = () => {
    setTeamName("");
    setDescription("");
    setUserId("");
    setRoleId("");
    setStatus("active");
    setSaveError(false);
    setNameErrorMessage("");
    setNameWarnings([]);
  };

  // Debounced name change handler
  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setTeamName(newName);
    
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
      // Validate team name
      if (!teamName.trim()) {
        setNameErrorMessage("Team name is required.");
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!userId || !roleId) {
        setLoading(false);
        setSaveError(true);
        return;
      }

      // Final name validation before submit
      const validation = await validateName(teamName);
      if (!validation.isValid) {
        setNameErrorMessage(validation.errorMessage);
        setLoading(false);
        return;
      }

      // Optional: Check if there are warnings
      if (nameWarnings.length > 0) {
        const confirmSubmit = window.confirm(
          "There are similar teams. Are you sure you want to continue?"
        );
        if (!confirmSubmit) {
          setLoading(false);
          return;
        }
      }

      // Prepare data for submission
      const teamData: TeamData = {
        name: teamName.trim(),
        description: description.trim(),
        user_id: userId,
        role_id: roleId,
        entity_id: userId, // Using user_id as entity_id for now
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert new team
      const { error: insertError } = await supabase
        .from("teams")
        .insert(teamData);

      if (insertError) {
        if (insertError.code === '23505') { // PostgreSQL unique violation
          setNameErrorMessage("A team with this name already exists.");
          return;
        }
        throw insertError;
      }

      // Success - redirect to team management page
      router.push("/dashboard/user-management/team-management");
      
    } catch (error) {
      console.error("Error creating team:", error);
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
        description="Creating team..."
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300">Creating team...</p>
          </div>
        </div>
      </DashboardWrapper>
    );
  }

  // Main render
  return (
    <DashboardWrapper
      title="Create New Team"
      description="Create a new team and assign members."
    >
      <div className="p-6">
        <Card className="p-6 dark:border-zinc-800">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">
            Create New Team
          </h1>
          {saveError && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              Error saving team. Please try again.
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {/* Team Name Field */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-semibold text-foreground dark:text-white">
                Team Name
              </label>
              <input
                type="text"
                placeholder="Enter team name"
                value={teamName}
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
                placeholder="Enter team description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white p-3 outline-none shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                rows={3}
              />
            </div>

            {/* User Selection */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-semibold text-foreground dark:text-white">
                Team Owner
              </label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white p-3 outline-none shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              >
                <option value="">Select a user</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-semibold text-foreground dark:text-white">
                Team Role
              </label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white p-3 outline-none shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              >
                <option value="">Select a role</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
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
                onClick={() => router.push("/dashboard/user-management/team-management")}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-white hover:bg-primary/90 dark:bg-white dark:text-black dark:hover:bg-gray-300"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Team"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardWrapper>
  );
};

export default NewTeam;