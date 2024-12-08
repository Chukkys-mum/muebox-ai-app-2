// app/dashboard/user-management/users/new/page.tsx

'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import dynamic from 'next/dynamic';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNameValidation } from '@/hooks/useNameValidation';
import DashboardWrapper from '@/components/layout/dashboard-wrapper';

interface Role {
  id: string;
  name: string;
}

interface PersonalityProfile {
  id: string;
  name: string;
}

interface Company {
  id: string;
  name: string;
}

interface UserData {
  full_name: string;
  username: string;
  email: string;
  avatar_url: string;
  credits: number;
  billing_address: any | null;
  payment_method: any | null;
  display_picture: string;
  status: string;
  company_id: string;
  role_id: string;
  personality_profile_id: string;
  entity_id: string;
  created_at: string;
  updated_at: string;
}

const NewUser = () => {
  // Form state
  const [fullName, setFullName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [credits, setCredits] = useState<number>(0);
  const [displayPicture, setDisplayPicture] = useState<string>("");
  const [status, setStatus] = useState<string>("active");
  const [companyId, setCompanyId] = useState<string>("");
  const [roleId, setRoleId] = useState<string>("");
  const [profileId, setProfileId] = useState<string>("");
  
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [availableProfiles, setAvailableProfiles] = useState<PersonalityProfile[]>([]);
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<boolean>(false);
  const [nameErrorMessage, setNameErrorMessage] = useState<string>("");
  const [nameWarnings, setNameWarnings] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<string>("");

  // Hooks
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { validateName, isValidating } = useNameValidation({
    tableName: 'users',
    minSimilarity: 0.8,
    customErrorMessage: 'A user with this name already exists',
    customWarningMessage: 'Similar user exists: "{name}"',
    enableSimilarCheck: true
  });

  // Effect to clear error messages
  useEffect(() => {
    setNameErrorMessage("");
  }, [fullName]);

  useEffect(() => {
    setEmailError("");
  }, [email]);

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

  // Effect to fetch available personality profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('personality_profiles')
          .select('id, name')
          .eq('status', 'active')
          .order('name');

        if (error) throw error;
        setAvailableProfiles(data || []);
      } catch (error) {
        console.error('Error fetching personality profiles:', error);
      }
    };

    fetchProfiles();
  }, [supabase]);

  // Effect to fetch available companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name')
          .eq('status', 'active')
          .order('name');

        if (error) throw error;
        setAvailableCompanies(data || []);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchCompanies();
  }, [supabase]);

  // Form reset function
  const resetForm = () => {
    setFullName("");
    setUsername("");
    setEmail("");
    setAvatarUrl("");
    setCredits(0);
    setDisplayPicture("");
    setStatus("active");
    setCompanyId("");
    setRoleId("");
    setProfileId("");
    setSaveError(false);
    setNameErrorMessage("");
    setNameWarnings([]);
    setEmailError("");
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Debounced name change handler
  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFullName(newName);
    
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
    setEmailError("");
    
    try {
      // Validate required fields
      if (!fullName.trim()) {
        setNameErrorMessage("Full name is required.");
        setLoading(false);
        return;
      }

      if (!email.trim()) {
        setEmailError("Email is required.");
        setLoading(false);
        return;
      }

      if (!validateEmail(email)) {
        setEmailError("Invalid email format.");
        setLoading(false);
        return;
      }

      // Final name validation before submit
      const validation = await validateName(fullName);
      if (!validation.isValid) {
        setNameErrorMessage(validation.errorMessage);
        setLoading(false);
        return;
      }

      // Optional: Check if there are warnings
      if (nameWarnings.length > 0) {
        const confirmSubmit = window.confirm(
          "There are similar users. Are you sure you want to continue?"
        );
        if (!confirmSubmit) {
          setLoading(false);
          return;
        }
      }

      // Prepare data for submission
      const userData: UserData = {
        full_name: fullName.trim(),
        username: username.trim() || fullName.trim().toLowerCase().replace(/\s+/g, '.'),
        email: email.trim().toLowerCase(),
        avatar_url: avatarUrl.trim(),
        credits: credits,
        billing_address: null,
        payment_method: null,
        display_picture: displayPicture.trim(),
        status,
        company_id: companyId,
        role_id: roleId,
        personality_profile_id: profileId,
        entity_id: '', // Will be set to user's id after creation
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert new user
      const { data, error: insertError } = await supabase
        .from("users")
        .insert(userData)
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') { // PostgreSQL unique violation
          setEmailError("A user with this email already exists.");
          return;
        }
        throw insertError;
      }

      // Update entity_id with the new user's id
      if (data) {
        const { error: updateError } = await supabase
          .from("users")
          .update({ entity_id: data.id })
          .eq('id', data.id);

        if (updateError) throw updateError;
      }

      // Success - redirect to user management page
      router.push("/dashboard/user-management/users");
      
    } catch (error) {
      console.error("Error creating user:", error);
      setSaveError(true);
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <DashboardLayout
        title="Loading..."
        description="Creating user..."
        user={null}
        userDetails={null}
        products={[]}
        subscription={null}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300">Creating user...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Main render
  // Main render section update
return (
  <DashboardLayout
    title="Create New User"
    description="Add a new user to your application."
    user={null}
    userDetails={null}
    products={[]}
    subscription={null}
  >
    <div className="p-6">
      <Card className="p-6 dark:border-zinc-800">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">
          Create New User
        </h1>
        {saveError && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            Error saving user. Please try again.
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {/* Full Name Field */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-semibold text-foreground dark:text-white">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="Enter full name"
              value={fullName}
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

          {/* Email Field */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-semibold text-foreground dark:text-white">
              Email *
            </label>
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white p-3 outline-none shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">
                {emailError}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-semibold text-foreground dark:text-white">
              Role *
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

          {/* Personality Profile Selection */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-semibold text-foreground dark:text-white">
              Personality Profile *
            </label>
            <select
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white p-3 outline-none shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            >
              <option value="">Select a personality profile</option>
              {availableProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selection */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-semibold text-foreground dark:text-white">
              Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white p-3 outline-none shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/user-management/users")}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-white hover:bg-primary/90 dark:bg-white dark:text-black dark:hover:bg-gray-300"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save User"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  </DashboardLayout>
);
}