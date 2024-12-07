'use client';

import React, { useState } from 'react';

const DeactivateAccount: React.FC = () => {
  const [accountType, setAccountType] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');
  const [confirmation, setConfirmation] = useState<boolean>(false);

  const handleDeactivate = () => {
    if (!accountType || !password || !confirmation) {
      alert('Please complete all required fields before proceeding.');
      return;
    }

    // Add logic for initiating account deletion here
    alert(`The ${accountType} account has been deactivated.`);
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-md">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
        Deactivate account
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
        Deactivating an account will remove access to all Local Gov.ai products and data. You can cancel the deactivation within 14 calendar days.
      </p>

      {/* Account Type Selection */}
      <div className="mb-6">
        <label htmlFor="accountType" className="block text-sm font-medium text-zinc-900 dark:text-white">
          Select account type to deactivate
        </label>
        <select
          id="accountType"
          value={accountType || ''}
          onChange={(e) => setAccountType(e.target.value)}
          className="w-full mt-2 p-2 border rounded-md bg-white dark:bg-zinc-800 dark:text-white"
        >
          <option value="" disabled>Select account type</option>
          <option value="Directorate">Directorate</option>
          <option value="Service">Service</option>
          <option value="Team">Team</option>
          <option value="Team Member">Team Member</option>
        </select>
      </div>

      {/* Password Field */}
      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-zinc-900 dark:text-white">
          Account password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter current password"
          className="w-full mt-2 p-2 border rounded-md bg-white dark:bg-zinc-800 dark:text-white"
        />
      </div>

      {/* Confirmation Checkbox */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={confirmation}
            onChange={(e) => setConfirmation(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-zinc-900 dark:text-white">
            I confirm that I want to delete the <strong>{accountType || '[Account Name]'}</strong> account
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => alert('Cancellation initiated')}
          className="px-4 py-2 border border-zinc-600 text-zinc-600 rounded-md hover:bg-zinc-100 dark:border-zinc-400 dark:text-white dark:hover:bg-zinc-800"
        >
          Learn more
        </button>
        <button
          onClick={handleDeactivate}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500"
        >
          Deactivate account
        </button>
      </div>
    </div>
  );
};

export default DeactivateAccount;
