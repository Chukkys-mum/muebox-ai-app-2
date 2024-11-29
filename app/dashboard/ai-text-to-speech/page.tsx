import TTS from '@/components/dashboard/text-to-speech';
import { DatabaseTTS } from '@/types/types_db';
import {
  getProducts,
  getSubscription,
  getUser,
  getUserDetails
} from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function TextToSpeech() {
  const supabase = createClient();
  const [user, userDetails, products, subscription] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase),
    getProducts(supabase),
    getSubscription(supabase)
  ]);

  const updateCredits = async (credits: number) => {
    'use server';

    const newCredits = credits - 1;
    const supabase = createServerActionClient<DatabaseTTS>({ cookies });

    console.log(newCredits);
    if (subscription) {
      const { error } = await supabase
        .from('users')
        .update({ credits: newCredits })
        .eq('id', user?.id);
      if (error) {
        console.log(error);
      }
    } else {
      const { error } = await supabase
        .from('users')
        .update({ trial_credits: newCredits })
        .eq('id', user?.id);
      if (error) {
        console.log(error);
      }
    }
    revalidatePath('/dashboard/settings');
  };

  if (!user) {
    return redirect('/dashboard/signin');
  }

  // if (!subscription) {
  //   redirect('/dashboard/free-converter');
  // }
  return (
    <TTS
      userDetails={userDetails}
      user={user}
      products={products}
      subscription={subscription}
      updateCredits={updateCredits}
    />
  );
}
