// app/dashboard/user-management/users/edit/[user_id]/page.tsx

'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import DashboardLayout from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNameValidation } from '@/hooks/useNameValidation';
import { cn } from "@/lib/utils";

interface Role {
 id: string;
 name: string;
}

interface PersonalityProfile {
 id: string;
 name: string;
}

export default function EditUser() {
 const router = useRouter();
 const params = useParams();
 const supabase = createClientComponentClient();
 const userId = params.user_id as string;

 const [loading, setLoading] = useState(true);
 const [fullName, setFullName] = useState('');
 const [email, setEmail] = useState('');
 const [status, setStatus] = useState('active');
 const [roleId, setRoleId] = useState('');
 const [profileId, setProfileId] = useState('');
 const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
 const [availableProfiles, setAvailableProfiles] = useState<PersonalityProfile[]>([]);
 const [nameErrorMessage, setNameErrorMessage] = useState('');
 const [emailError, setEmailError] = useState('');
 const [saveError, setSaveError] = useState(false);

 const { validateName, isValidating } = useNameValidation({
   tableName: 'users',
   columnName: 'full_name',
   minSimilarity: 0.8,
   customErrorMessage: 'A user with this name already exists',
   customWarningMessage: 'Similar user exists: "{name}"',
   skipId: userId
 });

 useEffect(() => {
   const fetchData = async () => {
     try {
       setLoading(true);
       
       // Fetch user details
       const { data: user, error: userError } = await supabase
         .from('users')
         .select('*')
         .eq('id', userId)
         .single();

       if (userError) throw userError;

       if (user) {
         setFullName(user.full_name || '');
         setEmail(user.email || '');
         setStatus(user.status || 'active');
         setRoleId(user.role_id || '');
         setProfileId(user.personality_profile_id || '');
       }

       // Fetch roles
       const { data: roles } = await supabase
         .from('roles')
         .select('id, name')
         .eq('status', 'active')
         .order('name');

       setAvailableRoles(roles || []);

       // Fetch personality profiles
       const { data: profiles } = await supabase
         .from('personality_profiles')
         .select('id, name')
         .eq('status', 'active')
         .order('name');

       setAvailableProfiles(profiles || []);

     } catch (error) {
       console.error('Fetch error:', error);
       setSaveError(true);
     } finally {
       setLoading(false);
     }
   };

   fetchData();
 }, [userId, supabase]);

 const validateEmail = (email: string): boolean => {
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return emailRegex.test(email);
 };

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
   e.preventDefault();
   setLoading(true);
   setSaveError(false);
   setNameErrorMessage('');
   setEmailError('');
   
   try {
     if (!fullName.trim()) {
       setNameErrorMessage('Full name is required.');
       setLoading(false);
       return;
     }

     if (!email.trim()) {
       setEmailError('Email is required.');
       setLoading(false);
       return;
     }

     if (!validateEmail(email)) {
       setEmailError('Invalid email format.');
       setLoading(false);
       return;
     }

     const validation = await validateName(fullName);
     if (!validation.isValid) {
       setNameErrorMessage(validation.errorMessage);
       setLoading(false);
       return;
     }

     const { error: updateError } = await supabase
       .from('users')
       .update({
         full_name: fullName.trim(),
         email: email.trim().toLowerCase(),
         role_id: roleId,
         personality_profile_id: profileId,
         status,
         updated_at: new Date().toISOString()
       })
       .eq('id', userId);

     if (updateError) throw updateError;

     router.push('/dashboard/user-management/users');
     
   } catch (error) {
     console.error('Error updating user:', error);
     setSaveError(true);
   } finally {
     setLoading(false);
   }
 };

 if (loading) {
   return (
     <DashboardLayout
       title="Loading..."
       description="Loading user details..."
       user={null}
       userDetails={null}
       products={[]}
       subscription={null}
     >
       <div className="flex items-center justify-center min-h-screen">
         <div className="text-center">
           <p className="text-lg text-foreground">Loading user...</p>
         </div>
       </div>
     </DashboardLayout>
   );
 }

 return (
   <DashboardLayout
     title="Edit User"
     description="Modify user details and permissions."
     user={null}
     userDetails={null}
     products={[]}
     subscription={null}
   >
     <div className="p-6">
       <Card className="p-6">
         <form onSubmit={handleSubmit}>
           <div className="space-y-6">
             <div>
               <h1 className="text-3xl font-bold text-foreground">Edit User</h1>
               <p className="text-sm text-muted-foreground mt-2">
                 Update the user details and permissions.
               </p>
             </div>

             {saveError && (
               <Alert variant="destructive">
                 <AlertDescription>
                   An error occurred while saving the user. Please try again.
                 </AlertDescription>
               </Alert>
             )}

             <div className="space-y-4">
               <div>
                 <Label htmlFor="fullName">Full Name</Label>
                 <Input
                   id="fullName"
                   value={fullName}
                   onChange={(e) => setFullName(e.target.value)}
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
                 <Label htmlFor="email">Email</Label>
                 <Input
                   id="email"
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className={cn(
                     "bg-background text-foreground",
                     emailError ? 'border-red-500' : 'border-input'
                   )}
                 />
                 {emailError && (
                   <p className="text-sm text-red-500 mt-1">{emailError}</p>
                 )}
               </div>

               <div>
                 <Label htmlFor="role">Role</Label>
                 <select
                   id="role"
                   value={roleId}
                   onChange={(e) => setRoleId(e.target.value)}
                   className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                   required
                 >
                   <option value="">Select a role</option>
                   {availableRoles.map((role) => (
                     <option key={role.id} value={role.id}>
                       {role.name}
                     </option>
                   ))}
                 </select>
               </div>

               <div>
                 <Label htmlFor="profile">Personality Profile</Label>
                 <select
                   id="profile"
                   value={profileId}
                   onChange={(e) => setProfileId(e.target.value)}
                   className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                   required
                 >
                   <option value="">Select a personality profile</option>
                   {availableProfiles.map((profile) => (
                     <option key={profile.id} value={profile.id}>
                       {profile.name}
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
                   <option value="pending">Pending</option>
                 </select>
               </div>
             </div>

             <div className="flex justify-end space-x-4">
               <Button
                 type="button"
                 variant="outline"
                 onClick={() => router.push('/dashboard/user-management/users')}
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