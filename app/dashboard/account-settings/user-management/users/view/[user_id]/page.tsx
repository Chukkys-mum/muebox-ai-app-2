// app/dashboard/user-management/users/view/[user_id]/page.tsx

'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  CreditCard, 
  Building2, 
  Users, 
  Settings, 
  Activity,
  Mail,
  UserCircle 
} from "lucide-react";
import DashboardLayout from "@/app/auth/layout";

interface UserDetails {
  id: string;
  full_name: string;
  email: string;
  username: string;
  avatar_url: string;
  display_picture: string;
  status: string;
  credits: number;
  billing_address: any;
  payment_method: any;
  company_id: string;
  role_id: string;
  personality_profile_id: string;
  created_at: string;
  updated_at: string;
  role?: {
    name: string;
  };
  teams?: {
    id: string;
    name: string;
    role: string;
  }[];
  company?: {
    name: string;
  };
}

export default function ViewUser() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient();
  const userId = params.user_id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'teams' | 'settings' | 'activity'>('profile');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select(`
            *,
            role:role_id(name),
            company:company_id(name),
            teams!teams_users(
              id,
              name,
              roles:role_id(name)
            )
          `)
          .eq('id', userId)
          .single();

        if (error) throw error;

        if (data) {
          setUserDetails(data);
        }
      } catch (error: any) {
        console.error('Error fetching user details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, supabase]);

  if (loading) {
    return (
      <DashboardLayout
        title="Loading..."
        description="Loading user details"
        user={null}
        userDetails={null}
        products={[]}
        subscription={null}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-foreground">Loading user details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !userDetails) {
    return (
      <DashboardLayout
        title="Error"
        description="Error loading user details"
        user={null}
        userDetails={null}
        products={[]}
        subscription={null}
      >
        <div className="p-6">
          <Card className="p-6">
            <h1 className="text-xl font-extrabold text-foreground md:text-3xl mb-6">
              {error || 'User not found'}
            </h1>
            <Button
              onClick={() => router.push('/dashboard/user-management/users')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Back to Users
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="View User"
      description="View user details and information"
      user={null}
      userDetails={null}
      products={[]}
      subscription={null}
    >
      <div className="p-6">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Header with Avatar */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userDetails.avatar_url || userDetails.display_picture} />
                  <AvatarFallback>
                    {userDetails.full_name?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{userDetails.full_name}</h1>
                  <p className="text-sm text-muted-foreground mt-1">{userDetails.username}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={userDetails.status === 'active' ? 'default' : 'secondary'}>
                      {userDetails.status}
                    </Badge>
                    {userDetails.role?.name && (
                      <Badge variant="outline">{userDetails.role.name}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => router.push(`/dashboard/user-management/users/edit/${userId}`)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Edit User
              </Button>
            </div>

            <Tabs 
              value={activeTab} 
              onValueChange={(value: string) => setActiveTab(value as any)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Billing
                </TabsTrigger>
                <TabsTrigger value="teams" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Teams
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-foreground font-semibold">Full Name</Label>
                      <p className="mt-1 text-foreground">{userDetails.full_name}</p>
                    </div>
                    <div>
                      <Label className="text-foreground font-semibold">Email</Label>
                      <p className="mt-1 text-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {userDetails.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-foreground font-semibold">Username</Label>
                      <p className="mt-1 text-foreground flex items-center gap-2">
                        <UserCircle className="h-4 w-4" />
                        {userDetails.username}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-foreground font-semibold">Company</Label>
                      <p className="mt-1 text-foreground flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {userDetails.company?.name || 'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-foreground font-semibold">Role</Label>
                      <p className="mt-1 text-foreground">
                        {userDetails.role?.name || 'No role assigned'}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="billing" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground font-semibold">Credits</Label>
                    <p className="mt-1 text-foreground">{userDetails.credits || 0}</p>
                  </div>
                  <div>
                    <Label className="text-foreground font-semibold">Payment Method</Label>
                    <p className="mt-1 text-foreground">
                      {userDetails.payment_method?.type || 'No payment method'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-foreground font-semibold">Billing Address</Label>
                    <p className="mt-1 text-foreground">
                      {userDetails.billing_address?.street || 'No billing address'}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="teams" className="space-y-4">
                <div className="rounded-md border">
                  {userDetails.teams && userDetails.teams.length > 0 ? (
                    <div className="divide-y">
                      {userDetails.teams.map((team) => (
                        <div key={team.id} className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{team.name}</p>
                            <p className="text-sm text-muted-foreground">{team.role}</p>
                          </div>
                          <Button
                            variant="ghost"
                            onClick={() => router.push(`/dashboard/user-management/teams/view/${team.id}`)}
                          >
                            View Team
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No team memberships
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-foreground font-semibold">Created At</Label>
                      <p className="mt-1 text-foreground">
                        {new Date(userDetails.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-foreground font-semibold">Last Updated</Label>
                      <p className="mt-1 text-foreground">
                        {new Date(userDetails.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <div className="rounded-md border p-4">
                  <p className="text-muted-foreground">Activity log coming soon...</p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => router.push('/dashboard/user-management/users')}
                variant="outline"
                className="bg-background"
              >
                Back to Users
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}