import Link from 'next/link';
import Settings from '@/components/dashboard/personality';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUserDetails, getUser } from '@/utils/supabase/queries';
import Personality from '@/components/dashboard/personality';

export default async function PersonalityPage() {
  const supabase = createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);
  if (!user) {
    return redirect('/dashboard/signin');
  }

  return <Personality userDetails={userDetails} user={user} />;
}
