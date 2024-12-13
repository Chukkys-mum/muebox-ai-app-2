// /components/routes.tsx

// Import necessary types and icons
import { IRoute } from '@/types'; // Ensure your type definition is correct and includes "icon" as JSX.Element
import {
  HiOutlineCog8Tooth,
  HiOutlineCpuChip,
  HiOutlineCreditCard,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineDocument,
  HiOutlineFolder,
  HiOutlineBookOpen,
  HiOutlineMicrophone,
  HiOutlineArchiveBox,
  HiOutlineEnvelope
} from 'react-icons/hi2';

// Define the route configurations
export const routes: IRoute[] = [
  {
    name: 'Main Dashboard',
    path: '/dashboard/main',
    icon: <HiOutlineHome />, // Wrapped in JSX
    collapse: false
  },
  {
    name: 'AI Pages',
    path: '/ai-pages',
    icon: <HiOutlineCpuChip />, // Wrapped in JSX
    collapse: true,
    items: [
      {
        name: 'AI Generator',
        path: '/dashboard/ai-generator',
        collapse: false
      },
      {
        name: 'AI Assistant',
        path: '/dashboard/ai-assistant',
        collapse: false
      },
      {
        name: 'AI Chat',
        path: '/dashboard/ai-chat',
        collapse: false
      },
      {
        name: 'AI Text to Speech',
        path: '/dashboard/ai-text-to-speech',
        collapse: false
      }
    ]
  },
  // {
  //  name: 'AI Generator',
  //  path: '/dashboard/ai-generator',
  //  icon: <MdWorkspacePremium className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
  //  collapse: false,
  // },
  // {
  //  name: 'AI Assistant',
  //  path: '/dashboard/ai-assistant', 
  //  icon: <MdAssistant className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
  //  collapse: false,
  // },
  // {
  //  name: 'AI Chat',
  //  path: '/dashboard/ai-chat',
  //  icon: <MdAutoAwesome className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
  //  collapse: false,
  // },
  {
    name: 'Templates',
    path: '/dashboard/template',
    icon: <HiOutlineDocument />, // Wrapped in JSX
    collapse: false
  },
  {
    name: 'Files',
    path: '/dashboard/files',
    icon: <HiOutlineFolder />, // Wrapped in JSX
    collapse: false
  },
  {
    name: 'Knowledge Base',
    path: '/dashboard/knowledge-base',
    icon: <HiOutlineBookOpen />, // Wrapped in JSX
    collapse: false
  },
  {
    name: 'Email',
    path: '/dashboard/email',
    icon: <HiOutlineEnvelope />, // Wrapped in JSX
    collapse: true,
    items: [
      {
        name: 'Inbox',
        path: '/dashboard/email/inbox',
        collapse: false
      },
      {
        name: 'Compose',
        path: '/dashboard/email/compose',
        collapse: false
      },
      {
        name: 'Settings',
        path: '/dashboard/email/settings',
        collapse: false
      }
    ]
  },
  {
    name: 'Time Machine',
    path: '/dashboard/time-machine',
    icon: <HiOutlineArchiveBox />, // Wrapped in JSX
    collapse: true,
    items: [
      {
        name: 'Archive',
        path: '/dashboard/time-machine/archive',
        collapse: false
      },
      {
        name: 'Trash',
        path: '/dashboard/time-machine/trash',
        collapse: false
      }
    ]
  },
  {
    name: 'Users List',
    path: '/dashboard/users-list',
    icon: <HiOutlineUsers />, // Wrapped in JSX
    collapse: false
  },
  {
    name: 'Profile Settings',
    path: '/dashboard/settings',
    icon: <HiOutlineCog8Tooth />, // Wrapped in JSX
    collapse: true,
    items: [
      {
        name: 'Profile',
        path: '/dashboard/settings/profile',
        collapse: false
      },
      {
        name: 'LLM Config',
        path: '/dashboard/settings/llm',
        collapse: false
      }
    ]
  },
  {
    name: 'Subscription',
    path: '/dashboard/subscription',
    icon: <HiOutlineCreditCard />, // Wrapped in JSX
    collapse: false
  },
  {
    name: 'Landing Page',
    path: '/home',
    icon: <HiOutlineDocumentText />, // Wrapped in JSX
    collapse: false,
    isPublic: true // Flag for public route
  },
  {
    name: 'Pricing Page',
    path: '/pricing',
    icon: <HiOutlineCurrencyDollar />, // Wrapped in JSX
    collapse: false
  }
];

// Filter private routes (excluding public routes)
const privateRoutes = routes.filter(route => !route.isPublic);