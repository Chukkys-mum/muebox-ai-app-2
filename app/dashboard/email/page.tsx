// /app/dashboard/email/page.tsx

import { Metadata } from 'next';
import EmailLayout from '@/components/layout/EmailLayout';
import EmailList from '@/components/modules/email/EmailList';
import { mockEmails } from '@/data/email';

export const metadata: Metadata = {
  title: 'Email | Dashboard',
  description: 'Email inbox and management interface',
};

export default function EmailPage() {
  return (
    <EmailLayout page="inbox">
      <EmailList emails={mockEmails} />
    </EmailLayout>
  );
}