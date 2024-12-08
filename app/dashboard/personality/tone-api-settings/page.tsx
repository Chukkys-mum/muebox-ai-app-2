import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUserDetails, getUser } from '@/utils/supabase/queries';
import ToneApiSettings from '@/components/dashboard/personality/profiles/tone-api-settings/tone-api-settings';

export default async function ToneApiSettingsPage() {
  const supabase = createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/dashboard/signin');
  }

  return (
    <ToneApiSettings
      user={user}
      userDetails={userDetails}
    />
  );
}
