// /app/dashboard/user-management/team-management/view/[team_id]/page.tsx

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
import { Users, Settings, History } from "lucide-react";
import { DashboardWrapper } from '@/components/layout/dashboard-wrapper';

interface TeamMember {
  id: string;
  user_id: string;
  role_id: string;
  user: {
    full_name: string;
    email: string;
    status: string;
  };
  role: {
    name: string;
  };
}

interface TeamDetails {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  members: TeamMember[];
}

export default function ViewTeam() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient();
  const teamId = params.team_id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'settings' | 'activity'>('members');

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        setLoading(true);
        // Fetch team details with members and their roles
        const { data, error } = await supabase
          .from('teams')
          .select(`
            *,
            members:user_id (
              id,
              full_name,
              email,
              status,
              roles:role_id (
                name
              )
            )
          `)
          .eq('id', teamId)
          .single();

        if (error) throw error;

        if (data) {
          setTeamDetails(data as TeamDetails);
        }
      } catch (error: any) {
        console.error('Error fetching team details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [teamId, supabase]);

  if (loading) {
    return (
      <DashboardWrapper
        title="Loading..."
        description="Loading team details"
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-foreground">Loading team details...</p>
          </div>
        </div>
      </DashboardWrapper>
    );
  }

  if (error || !teamDetails) {
    return (
      <DashboardWrapper
        title="Error"
        description="Error loading team details"
      >
        <div className="p-6">
          <Card className="p-6">
            <h1 className="text-xl font-extrabold text-foreground md:text-3xl mb-6">
              {error || 'Team not found'}
            </h1>
            <Button
              onClick={() => router.push('/dashboard/user-management/team-management')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Back to Team Management
            </Button>
          </Card>
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper
      title="View Team"
      description="View team details and members"
    >
      <div className="p-6">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Team Details</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  View team information, members, and settings.
                </p>
              </div>
              <Button
                onClick={() => router.push(`/dashboard/user-management/team-management/edit/${teamId}`)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Edit Team
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-foreground font-semibold">Team Name</Label>
                <p className="mt-1 text-foreground">{teamDetails.name}</p>
              </div>

              <div>
                <Label className="text-foreground font-semibold">Description</Label>
                <p className="mt-1 text-foreground">
                  {teamDetails.description || 'No description provided'}
                </p>
              </div>

              <div>
                <Label className="text-foreground font-semibold">Status</Label>
                <Badge 
                  variant={teamDetails.status === 'active' ? 'default' : 'secondary'}
                  className="mt-1"
                >
                  {teamDetails.status}
                </Badge>
              </div>

              <Tabs 
                value={activeTab} 
                onValueChange={(value: string) => setActiveTab(value as 'members' | 'settings' | 'activity')}
                className="w-full"
              >
                <TabsList>
                  <TabsTrigger value="members" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Members
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamDetails.members.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.user.full_name}</TableCell>
                            <TableCell>{member.user.email}</TableCell>
                            <TableCell>{member.role.name}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={member.user.status === 'active' ? 'default' : 'secondary'}
                              >
                                {member.user.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-foreground font-semibold">Created At</Label>
                        <p className="mt-1 text-foreground">
                          {new Date(teamDetails.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-foreground font-semibold">Last Updated</Label>
                        <p className="mt-1 text-foreground">
                          {new Date(teamDetails.updated_at).toLocaleDateString()}
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
                  onClick={() => router.push('/dashboard/user-management/team-management')}
                  variant="outline"
                  className="bg-background"
                >
                  Back to Team Management
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardWrapper>
  );
}