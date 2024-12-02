// /data/email.ts

export interface Email {
    id: string;
    subject: string;
    sender: {
      name: string;
      email: string;
      avatar?: string; // Optional avatar property
    };
    excerpt: string;
    timestamp: Date;
    read: boolean;
    starred: boolean;
    attachments?: {
      name: string;
      size: string;
      type: string;
    }[];
  }
  
  export const mockEmails: Email[] = [
    {
      id: '1',
      subject: 'Weekly Team Updates',
      sender: {
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        avatar: '/placeholder/32/32', // Ensure avatar path is a valid string
      },
      excerpt: 'Here are the key updates from this week\'s team activities and progress...',
      timestamp: new Date('2024-01-01T10:00:00'),
      read: false,
      starred: true, // Boolean property correctly assigned
    },
    {
      id: '2',
      subject: 'Project Timeline Review',
      sender: {
        name: 'Michael Chen',
        email: 'm.chen@example.com', // Ensure email property is valid
      },
      excerpt: 'I\'ve reviewed the project timeline and have some suggestions for optimization...',
      timestamp: new Date('2024-01-01T09:30:00'),
      read: true,
      starred: false,
      attachments: [
        {
          name: 'timeline.pdf', // Ensure attachment properties are valid strings
          size: '2.4 MB',
          type: 'pdf',
        },
      ],
    },
    // Add more mock emails as needed...
  ];
  