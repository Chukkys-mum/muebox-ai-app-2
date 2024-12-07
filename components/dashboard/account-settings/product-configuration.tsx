'use client';

'use client';

import React, { useState } from 'react';

const DeactivateAccount: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeactivate = async () => {
    if (!confirmationChecked || !password) return;

    setIsLoading(true);

    try {
      // Simulate API call for account deactivation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert('Account deactivated successfully.');
      // Redirect or update UI after successful deactivation
    } catch (error) {
      alert('Failed to deactivate account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-md max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Deactivate Account</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
        Deactivating an account, you lose access to Local Gov.ai account products, and data. You can
        cancel the deactivation within 14 calendar days.
      </p>

      <div className="space-y-4">
        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-zinc-900 dark:text-white mb-1"
          >
            Account password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
            placeholder="Enter current password"
          />
        </div>

        {/* Confirmation Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="confirm-deactivation"
            checked={confirmationChecked}
            onChange={(e) => setConfirmationChecked(e.target.checked)}
            className="w-5 h-5 text-primary border border-zinc-300 dark:border-zinc-700 rounded"
          />
          <label
            htmlFor="confirm-deactivation"
            className="ml-3 text-sm text-zinc-600 dark:text-zinc-400"
          >
            I confirm that I want to delete my account.
          </label>
        </div>

        {/* Deactivate Button */}
        <div className="flex justify-end items-center mt-6">
          <button
            type="button"
            onClick={handleDeactivate}
            disabled={!confirmationChecked || !password || isLoading}
            className={`px-6 py-3 text-sm font-medium rounded-md text-white ${
              confirmationChecked && password && !isLoading
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-red-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Processing...' : 'Deactivate Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeactivateAccount;
