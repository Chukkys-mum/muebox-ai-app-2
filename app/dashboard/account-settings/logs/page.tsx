// /app/dashboard/account-settings/logs/page.tsx

// /app/dashboard/account-settings/logs/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import ActivityLog from '@/components/dashboard/account-settings/logs/ActivityLog';
import AuditLog from '@/components/dashboard/account-settings/logs/AuditLog';
import LoginSessions from '@/components/dashboard/account-settings/logs/LoginSessions';
import RecentDevices from '@/components/dashboard/account-settings/logs/RecentDevices';
import { useToast } from '@/hooks/use-toast';

const LogsPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'activity' | 'audit' | 'sessions' | 'devices'>('activity');
  const [data, setData] = useState({
    user: null,
    userDetails: null,
    products: [],
    subscription: null,
  });
  const [loading, setLoading] = useState(true);

  // Fetch required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, userDetailsRes, productsRes, subscriptionRes] = await Promise.all([
          fetch('/api/users/current').then((res) => res.json()),
          fetch('/api/user-details/current').then((res) => res.json()),
          fetch('/api/products').then((res) => res.json()),
          fetch('/api/subscriptions/current').then((res) => res.json()),
        ]);

        setData({
          user: userRes,
          userDetails: userDetailsRes,
          products: productsRes,
          subscription: subscriptionRes,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load necessary data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const tabs = [
    { key: 'activity', label: 'Activity Log', component: <ActivityLog /> },
    { key: 'audit', label: 'Audit Log', component: <AuditLog /> },
    { key: 'sessions', label: 'Login Sessions', component: <LoginSessions /> },
    { key: 'devices', label: 'Recent Devices', component: <RecentDevices /> },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Logs</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Monitor activities, sessions, and device usage across your account.
        </p>
      </div>
      
      <div className="logs-container">
        <nav className="logs-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`logs-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="logs-content">
          {loading ? (
            <div className="logs-loading">Loading...</div>
          ) : (
            tabs.find((tab) => tab.key === activeTab)?.component || (
              <div className="logs-error">Failed to load the selected tab. Please try again.</div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsPage;