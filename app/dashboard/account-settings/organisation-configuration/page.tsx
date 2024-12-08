// /app/dashboard/account-settings/organisation-configuration/page.tsx


'use client';
import React from 'react';
import DashboardLayout from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import OrganisationConfiguration from '@/components/dashboard/account-settings/Organisation-Configuration';
import EntityTypeConfiguration from '@/components/dashboard/account-settings/EntityTypeConfiguration';
import { EntityProvider } from '@/components/common/EntityContext';

const OrganisationConfigurationPage: React.FC = () => {
  return (
    <DashboardLayout
      title="Organisation Configuration"
      description="Define and manage your organisation's structure, including accounts, teams, and services."
      user={null}
      products={[]}
      subscription={null}
      userDetails={null}
    >
      <EntityProvider>
        <div className="p-6 space-y-6">
          {/* Rest of your existing code */}
          <Tabs defaultValue="structure" className="space-y-4">
            <TabsList>
              <TabsTrigger value="structure">Structure</TabsTrigger>
              <TabsTrigger value="hierarchy">Entity Types</TabsTrigger>
            </TabsList>

            <TabsContent value="structure">
              <Card className="p-6">
                <OrganisationConfiguration />
              </Card>
            </TabsContent>

            <TabsContent value="hierarchy">
              <Card className="p-6">
                <EntityTypeConfiguration />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </EntityProvider>
    </DashboardLayout>
  );
};

export default OrganisationConfigurationPage;