// /app/dashboard/email/page.tsx
import EmailInbox from '@/components/modules/email/EmailInbox';
import type Metadata from 'next';
import EmailLayout from '@/components/layout/EmailLayout';

export const metadata: Metadata = {
  title: 'Email | Dashboard',
  description: 'Email inbox and management interface',
};

export default function EmailPage() {
  return (
    <EmailLayout page="inbox">
      <EmailInbox />
    </EmailLayout>
  );
}