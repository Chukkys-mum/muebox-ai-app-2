// components/AccountSwitcher.tsx

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/hooks/useUser';

export function AccountSwitcher() {
  const { user } = useUser();
  const [accounts, setAccounts] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);

  useEffect(() => {
    if (user) {
      const supabase = createClient();
      supabase
        .from('account_users')
        .select('accounts(*)')
        .eq('user_id', user.id)
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching accounts:', error);
          } else {
            setAccounts(data.map(item => item.accounts));
            setCurrentAccount(data[0]?.accounts);
          }
        });
    }
  }, [user]);

  const switchAccount = (account) => {
    setCurrentAccount(account);
    // Implement logic to switch the current account context in your app
  };

  return (
    <div>
      <select onChange={(e) => switchAccount(JSON.parse(e.target.value))}>
        {accounts.map(account => (
          <option key={account.id} value={JSON.stringify(account)}>
            {account.name}
          </option>
        ))}
      </select>
    </div>
  );
}