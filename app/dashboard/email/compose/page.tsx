// /app/dashboard/email/compose/page.tsx

import  Metadata  from 'next';
import EmailLayout from '@/components/layout/EmailLayout';
import EmailCompose from '@/components/modules/email/EmailCompose';
import { useRouter } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Compose Email | Dashboard',
  description: 'Compose a new email message',
};

export default function ComposeEmailPage() {
  const router = useRouter();

  return (
    <EmailLayout page="compose">
      <EmailCompose
        onClose={() => router.back()}
      />
    </EmailLayout>
  );
}