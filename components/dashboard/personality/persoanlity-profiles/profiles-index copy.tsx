/*eslint-disable*/
'use client';

import DashboardLayout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User } from '@supabase/supabase-js';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/utils/supabase/client';
import { getURL, getStatusRedirect } from '@/utils/helpers';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
// Import your table component here
import TableProfiles from '@/components/ui/TableProfiles';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

const supabase = createClient();
export default function Profiles(props: Props) {
  // Input States
  const [nameError, setNameError] = useState<{
    status: boolean;
    message: string;
  }>();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    if (e.currentTarget.newEmail.value === props.user.email) {
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }
    const newEmail = e.currentTarget.newEmail.value.trim();
    const callbackUrl = getURL(
      getStatusRedirect(
        '/dashboard/personality',
        'Success!',
        `Your email has been updated.`
      )
    );
    e.preventDefault();
    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      { emailRedirectTo: callbackUrl }
    );
    router.push('/dashboard/personality');
    setIsSubmitting(false);
  };

  const handleSubmitName = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    if (e.currentTarget.fullName.value === props.user.user_metadata.full_name) {
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }
    const fullName = e.currentTarget.fullName.value.trim();
    const { error } = await supabase
      .from('users')
      .update({ full_name: fullName })
      .eq('id', props.user?.id);
    if (error) {
      console.log(error);
    }
    e.preventDefault();
    supabase.auth.updateUser({
      data: { full_name: fullName }
    });
    router.push('/dashboard/personality');
    setIsSubmitting(false);
  };

  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="Manage AI Profiles Setting"
      description="Create and manage AI Profiles for you and your teams."
    >
      <div className="relative mx-auto flex w-max max-w-full flex-col md:pt-[unset] lg:pt-[100px] lg:pb-[100px]">
        <div className="maw-w-full mx-auto w-full flex-col justify-center md:w-full md:flex-row xl:w-full">
          {/* Tone API Settings Card */}
          <Card className="mb-5 h-min max-w-full pt-8 pb-6 px-6 bg-white dark:bg-zinc-800 text-black dark:text-white shadow-md rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <div className="w-1/2">
                <p className="text-xl font-extrabold text-zinc-900 dark:text-white md:text-3xl">
                  Tone API Settings
                </p>
                <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-400 md:mt-4 md:text-base">
                  Connect your email accounts to enable AI tone analysis, allowing contextualized responses in different tones.
                </p>
              </div>
              <Link href="/dashboard/personality/profiles/tone-api-settings" passHref>
                <Button
                  className="bg-blue-600 dark:bg-blue-500 text-white dark:text-zinc-100 rounded-full w-auto h-full items-center justify-center px-4 py-2 text-base font-medium"
                  type="button"
                >
                  Manage Settings
                </Button>
              </Link>
            </div>
            <div className="mt-8 h-px w-full max-w-[90%] self-center bg-zinc-200 dark:bg-white/10 md:mt-0 md:hidden" />
            <p
              className={`mb-5 px-2.5 text-red-500 dark:text-red-400 md:px-9 ${
                nameError?.status ? 'block' : 'hidden'
              }`}
            >
              {nameError?.message}
            </p>
          </Card>

          {/* Manage Profiles Table Card */}
          <Card className="mb-5 h-min max-w-full pt-8 pb-6 px-6 bg-white dark:bg-zinc-800 text-black dark:text-white shadow-md rounded-lg">
            <div className="mb-6">
              <p className="text-xl font-extrabold text-zinc-900 dark:text-white md:text-3xl">
                Manage AI Profiles
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-400 md:mt-4 md:text-base">
                Create, view, and manage profiles for users and teams.
              </p>
            </div>
            {/* Render Table Component */}
            <TableProfiles />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
