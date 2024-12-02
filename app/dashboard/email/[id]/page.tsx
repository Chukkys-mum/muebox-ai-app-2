// /app/dashboard/email/[id]/page.tsx

import { Metadata } from 'next';
import EmailLayout from '@/components/layout/EmailLayout';
import EmailDetail from '@/components/modules/email/EmailDetail';
import { mockEmails } from '@/data/email';

interface EmailDetailPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'View Email | Dashboard',
  description: 'View email message details',
};

export default function EmailDetailPage({ params }: EmailDetailPageProps) {
  // In a real app, you would fetch the email data here
  // For now, we'll use mock data
  const email = {
    id: '1',
    subject: 'Weekly Team Updates',
    sender: {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      avatar: '/placeholder/32/32'
    },
    recipients: {
      to: [
        { name: 'John Doe', email: 'john@example.com' }
      ],
      cc: [
        { name: 'Team', email: 'team@example.com' }
      ]
    },
    content: `
      <p>Hi team,</p>
      <p>Here are the key updates from this week's team activities and progress:</p>
      <ul>
        <li>Completed the new feature implementation</li>
        <li>Fixed several critical bugs</li>
        <li>Updated the documentation</li>
      </ul>
      <p>Please review and let me know if you have any questions.</p>
      <p>Best regards,<br>Sarah</p>
    `,
    timestamp: new Date('2024-01-01T10:00:00'),
    starred: true,
    attachments: [
      {
        id: '1',
        name: 'weekly-report.pdf',
        size: '2.4 MB',
        type: 'application/pdf',
        url: '/path/to/file'
      }
    ]
  };

  return (
    <EmailLayout page="detail">
      <EmailDetail email={email} />
    </EmailLayout>
  );
}