/* eslint-disable */
'use client';
import DashboardLayout from '@/components/layout/index';
import { Card } from '@/components/ui/card';
import ConnectionCard from '@/components/dashboard/personality/profiles/tone-api-settings/connection-card';
import SyncSettings from '@/components/dashboard/personality/profiles/tone-api-settings/sync-settings';
import NotificationBanner from '@/components/dashboard/personality/profiles/tone-api-settings/notification-banner';
import ToneMetrics from '@/components/dashboard/personality/profiles/tone-api-settings/tone-metrics';

interface Props {
  user: any;
  userDetails: any;
}

export default function ToneApiSettingsPage(props: Props) {
  return (
    <DashboardLayout user={props.user} userDetails={props.userDetails} title={''} description={''}>
      <div className="relative mx-auto flex w-max max-w-full flex-col md:pt-[unset] lg:pt-[100px] lg:pb-[100px]">
        <div className="max-w-full mx-auto w-full flex-col justify-center md:w-full md:flex-row xl:w-full">
          <Card className="mb-5 h-min max-w-full pt-8 pb-6 px-6 dark:border-zinc-800">
            <SyncSettings />
          </Card>
          <Card className="mb-5 h-min max-w-full pt-8 pb-6 px-6 dark:border-zinc-800">
            <NotificationBanner />
          </Card>
          <Card className="mb-5 h-min max-w-full pt-8 pb-6 px-6 dark:border-zinc-800">
            <ToneMetrics />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
