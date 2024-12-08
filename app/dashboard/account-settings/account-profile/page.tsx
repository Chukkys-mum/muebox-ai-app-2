// /app/dashboard/account-settings/account-profile/page.tsx

'use client';

import React from 'react';
import AccountProfile from '@/components/dashboard/account-settings/AccountProfile';
import { Card } from '@/components/ui/card';

const AccountProfilePage: React.FC = () => {
  return (
    <div className="p-6">
      <Card className="p-6 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Account Profile
          </h1>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          Update your organisation's profile, including details like the organisation name, company number, tax ID, and contact details.
        </p>
        <AccountProfile />
      </Card>
    </div>
  );
};

export default AccountProfilePage;