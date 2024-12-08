/*eslint-disable*/
'use client';

import DashboardLayout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import TableProfiles from '@/components/ui/TableProfiles';
import { getURL, getStatusRedirect } from '@/utils/helpers';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

const supabase = createClient();

export default function Profiles(props: Props) {
  const [nameError, setNameError] = useState<{
    status: boolean;
    message: string;
  }>();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Theme consistency handling
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  const handleSubmitEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    if (e.currentTarget.newEmail.value === props.user?.email) {
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
    if (error) {
      console.log(error.message);
    }
    router.push('/dashboard/personality');
    setIsSubmitting(false);
  };

  const handleSubmitName = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    if (e.currentTarget.fullName.value === props.user?.user_metadata.full_name) {
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
      console.log(error.message);
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
      title="Manage AI Profiles"
      description="Create and manage AI Profiles for you and your teams."
    >
      <div className="relative mx-auto flex w-full max-w-[90%] flex-col md:pt-[unset] lg:pt-[100px] lg:pb-[100px]">
        {/* Manage Profiles Table Card */}
        <Card className="mb-5 h-min w-full pt-8 pb-6 px-6 bg-white dark:bg-zinc-800 text-black dark:text-white shadow-md rounded-lg">
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
    </DashboardLayout>
  );
}
