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
import Notifications from './components/notification-settings';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

const supabase = createClient();
export default function Personality(props: Props) {
  // Input States
  const [nameError, setNameError] = useState<{
    status: boolean;
    message: string;
  }>();
  console.log(props.user);
  console.log(props.userDetails);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    // Check if the new email is the same as the old email
    if (e.currentTarget.newEmail.value === props.user.email) {
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }
    // Get form data
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
      {
        emailRedirectTo: callbackUrl
      }
    );
    router.push('/dashboard/personality');
    setIsSubmitting(false);
  };

  const handleSubmitName = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    // Check if the new name is the same as the old name
    if (e.currentTarget.fullName.value === props.user.user_metadata.full_name) {
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }
    // Get form data
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
    router.push('/dashboard/Personality');
    setIsSubmitting(false);
  };

  const notifications = [
    { message: 'Your call has been confirmed.', time: '1 hour ago' },
    { message: 'You have a new message!', time: '1 hour ago' },
    { message: 'Your subscription is expiring soon!', time: '2 hours ago' }
  ];

  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="Personality Setting"
      description="Personality and Tone of Voice settings."
    >
      <div className="relative mx-auto flex w-max max-w-full flex-col md:pt-[unset] lg:pt-[100px] lg:pb-[100px]">
        <div className="maw-w-full mx-auto w-full flex-col justify-center md:w-full md:flex-row xl:w-full">
          <Card className="mb-5 h-min max-w-full pt-8 pb-6 px-6 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-6">
              <div className="w-1/2">
                <p className="text-xl font-extrabold text-zinc-950 dark:text-white md:text-3xl">
                  Tone API Settings
                </p>
                <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 md:mt-4 md:text-base">
                  Connect your email accounts to enable AI tone analysis, allowing contextualised responses in different tones.
                </p>
              </div>
              <Link href="/dashboard/personality/tone-api-settings" passHref>
                <Button
                  className="w-auto h-full items-center justify-center rounded-lg px-4 py-2 text-base font-medium"
                  type="button"
                >
                  Manage Settings
                </Button>
              </Link>
            </div>
            <div className="mt-8 h-px w-full max-w-[90%] self-center bg-zinc-200 dark:bg-white/10 md:mt-0 md:hidden" />
            <p
              className={`mb-5 px-2.5 text-red-500 md:px-9 ${
                nameError?.status ? 'block' : 'hidden'
              }`}
            >
              {nameError?.message}
            </p>
          </Card>
          <Notifications notifications={notifications} />
        </div>
      </div>
    </DashboardLayout>
  );
}
