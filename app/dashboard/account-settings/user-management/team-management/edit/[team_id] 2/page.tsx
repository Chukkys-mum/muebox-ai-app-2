// app/dashboard/user-management/team-management/edit/[team_id]/page.tsx

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

interface User {
 id: string;
 full_name: string;
 email: string;
}

interface Role {
 id: string;
 name: string;
}

export default function EditTeam() {
 const router = useRouter();
 const params = useParams();
 const supabase = createClientComponentClient();
 const teamId = params.team_id as string;

 const [loading, setLoading] = useState(true);
 const [teamName, setTeamName] = useState('');
 const [description, setDescription] = useState('');
 const [status, setStatus] = useState('active');
 const [userId, setUserId] = useState('');
 const [roleId, setRoleId] = useState('');
 const [availableUsers, setAvailableUsers] = useState<User[]>([]);
 const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
 const [nameErrorMessage, setNameErrorMessage] = useState('');
 const [saveError, setSaveError] = useState(false);

 const { validateName, isValidating } = useNameValidation({
   tableName: 'teams',
   minSimilarity: 0.8,
   customErrorMessage: 'A team with this name already exists',
   customWarningMessage: 'Similar team exists: "{name}"',
   skipId: teamId
 });

 useEffect(() => {
   const fetchData = async () => {
     try {
       setLoading(true);
       
       // Fetch team details
       const { data: team, error: teamError } = await supabase
         .from('teams')
         .select('*')
         .eq('id', teamId)
         .single();

       if (teamError) throw teamError;

       if (team) {
         setTeamName(team.name || '');
         setDescription(team.description || '');
         setStatus(team.status || 'active');
         setUserId(team.user_id || '');
         setRoleId(team.role_id || '');
       }

       // Fetch users
       const { data: users } = await supabase
         .from('users')
         .select('id, full_name, email')
         .eq('status', 'active')
         .order('full_name');

       setAvailableUsers(users || []);

       // Fetch roles
       const { data: roles } = await supabase
         .from('roles')
         .select('id, name')
         .eq('status', 'active')
         .order('name');

       setAvailableRoles(roles || []);

     } catch (error) {
       console.error('Fetch error:', error);
       setSaveError(true);
     } finally {
       setLoading(false);
     }
   };

   fetchData();
 }, [teamId, supabase]);

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
   e.preventDefault();
   setLoading(true);
   setSaveError(false);
   setNameErrorMessage('');
   
   try {
     if (!teamName.trim()) {
       setNameErrorMessage('Team name is required.');
       setLoading(false);
       return;
     }

     if (!userId || !roleId) {
       setSaveError(true);
       setLoading(false);
       return;
     }

     const validation = await validateName(teamName);
     if (!validation.isValid) {
       setNameErrorMessage(validation.errorMessage);
       setLoading(false);
       return;
     }

     const { error: updateError } = await supabase
       .from('teams')
       .update({
         name: teamName.trim(),
         description: description.trim(),
         user_id: userId,
         role_id: roleId,
         status,
         updated_at: new Date().toISOString()
       })
       .eq('id', teamId);

     if (updateError) throw updateError;

     router.push('/dashboard/user-management/team-management');
     
   } catch (error) {
     console.error('Error updating team:', error);
     setSaveError(true);
   } finally {
     setLoading(false);
   }
 };

 if (loading) {
   return (
     <DashboardWrapper
       title="Loading..."
       description="Loading team details..."
     >
       <div className="flex items-center justify-center min-h-screen">
         <div className="text-center">
           <p className="text-lg text-foreground">Loading team...</p>
         </div>
       </div>
     </DashboardWrapper>
   );
 }

 return (
   <DashboardWrapper
     title="Edit Team"
     description="Modify team details and members."
   >
     <div className="p-6">
       <Card className="p-6">
         <form onSubmit={handleSubmit}>
           <div className="space-y-6">
             <div>
               <h1 className="text-3xl font-bold text-foreground">Edit Team</h1>
               <p className="text-sm text-muted-foreground mt-2">
                 Update the team details and members.
               </p>
             </div>

             {saveError && (
               <Alert variant="destructive">
                 <AlertDescription>
                   An error occurred while saving the team. Please try again.
                 </AlertDescription>
               </Alert>
             )}

             <div className="space-y-4">
               <div>
                 <Label htmlFor="name">Team Name</Label>
                 <Input
                   id="name"
                   value={teamName}
                   onChange={(e) => setTeamName(e.target.value)}
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
                 <Label htmlFor="user">Team Owner</Label>
                 <select
                   id="user"
                   value={userId}
                   onChange={(e) => setUserId(e.target.value)}
                   className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                   required
                 >
                   <option value="">Select a user</option>
                   {availableUsers.map((user) => (
                     <option key={user.id} value={user.id}>
                       {user.full_name} ({user.email})
                     </option>
                   ))}
                 </select>
               </div>

               <div>
                 <Label htmlFor="role">Team Role</Label>
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
                 onClick={() => router.push('/dashboard/user-management/team-management')}
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