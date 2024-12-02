import { getUser, getUserDetails, getProducts, getSubscription } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DatabaseTTS } from '@/types/types_db'; // Add this import
import TTS from '@/components/dashboard/text-to-speech'; // Add this import

export default async function TextToSpeech() {
  const supabase = createClient();
  const user = await getUser(supabase);
  const userDetails = await getUserDetails(supabase);
  const products = await getProducts(supabase);
  const subscription = await getSubscription(supabase);

  const updateCredits = async (credits: number) => {
    'use server';

    const newCredits = credits - 1;
    const supabase = createServerActionClient<DatabaseTTS>({ cookies });

    console.log(newCredits);
    if (user?.id) {
      if (subscription) {
        const { error } = await supabase
          .from('users')
          .update({ credits: newCredits })
          .eq('id', user.id);
        if (error) {
          console.log(error);
        }
      } else {
        const { error } = await supabase
          .from('users')
          .update({ trial_credits: newCredits })
          .eq('id', user.id);
        if (error) {
          console.log(error);
        }
      }
    }
    revalidatePath('/dashboard/settings');
  };

  if (!user) {
    return redirect('/dashboard/signin');
  }

  return (
    <TTS
      userDetails={userDetails}
      user={user}
      products={products || []}
      subscription={subscription}
      updateCredits={updateCredits}
    />
  );
}