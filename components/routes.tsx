// /components/routes.tsx

// Auth Imports
import { IRoute } from '@/types/types';
import {
  HiOutlineCog8Tooth,
  HiOutlineCpuChip,
  HiOutlineCreditCard,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineDocument,  // Instead of HiOutlineTemplate
  HiOutlineFolder,
  HiOutlineBookOpen,  // Instead of HiOutlineBrain
  HiOutlineMicrophone,
  HiOutlineArchiveBox,  // Instead of HiOutlineArchive
  HiOutlineEnvelope
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
  name: 'Templates',
  path: '/dashboard/template',
  icon: (
    <HiOutlineDocument className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
  ),
  collapse: false
},
 {
  name: 'Files',
  path: '/dashboard/files',
  icon: (
    <HiOutlineFolder className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
  ),
  collapse: false
}, 
 {
  name: 'Knowledge Base',
  path: '/dashboard/knowledge-base',
  icon: (
    <HiOutlineBookOpen className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
  ),
  collapse: false
}, 
 {
   name: 'Email',
   path: '/dashboard/email',
   icon: (
     <HiOutlineEnvelope className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
   ),
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
  icon: (
     <HiOutlineArchiveBox className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
  ),
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