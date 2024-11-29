// Auth Imports
import { IRoute } from '@/types/types';
import {
  HiOutlineCog8Tooth,
  HiOutlineCpuChip,
  HiOutlineCreditCard,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineHome,
  HiOutlineUsers
} from 'react-icons/hi2';

export const routes: IRoute[] = [
  {
    name: 'Main Dashboard',
    path: '/dashboard/main',
    icon: <HiOutlineHome className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false
  },
  {
    name: 'AI Pages',
    path: '/ai-pages',
    icon: (
      <HiOutlineCpuChip className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
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
    name: 'Users List',
    path: '/dashboard/users-list',
    icon: (
      <HiOutlineUsers className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false
  },
  {
    name: 'Profile Settings',
    path: '/dashboard/settings',
    icon: (
      <HiOutlineCog8Tooth className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false
  },
  {
    name: 'Subscription',
    path: '/dashboard/subscription',
    icon: (
      <HiOutlineCreditCard className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false
  },
  {
    name: 'Landing Page',
    path: '/home',
    icon: (
      <HiOutlineDocumentText className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false
  },
  {
    name: 'Pricing Page',
    path: '/pricing',
    icon: (
      <HiOutlineCurrencyDollar className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false
  }
];
