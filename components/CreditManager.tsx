// components/CreditManager.tsx

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/hooks/useUser';

export function CreditManager() {
  const { user } = useUser();
  const [credits, setCredits] = useState(0);
  const [trialCredits, setTrialCredits] = useState(0);

  useEffect(() => {
    if (user) {
      const supabase = createClient();
      supabase
        .from('subscriptions')
        .select('credits, trial_credits')
        .eq('account_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching credits:', error);
          } else {
            setCredits(data.credits || 0);
            setTrialCredits(data.trial_credits || 0);
          }
        });
    }
  }, [user]);

  return (
    <div>
      <p>Available Credits: {credits}</p>
      <p>Trial Credits: {trialCredits}</p>
    </div>
  );
}