import Link from 'next/link';
import Profiles from '@/components/dashboard/personality/persoanlity-profiles/profiles-index';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUserDetails, getUser } from '@/utils/supabase/queries';

export default async function ProfilesPage() {
  const supabase = createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase),
  ]);

  if (!user) {
    return redirect('/dashboard/signin');
  }

  return <Profiles userDetails={userDetails} user={user} />;
}
