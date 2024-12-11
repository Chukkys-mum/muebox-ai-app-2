import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Member, members } from './users';
import {
  faArrowsUpToLine,
  faBoxArchive,
  faCheckDouble,
  faClone,
  faDownload,
  faFileExport,
  faPaperclip,
  faPlus,
  faRandom,
  faShareNodes,
  faShoppingBag,
  faSpinner,
  faSquarePlus,
  faTrashCan,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';
import kanban1 from 'assets/img/kanban/1.jpg';
import glass from 'assets/img/kanban/glass.jpg';
import home from 'assets/img/kanban/home.jpg';
import wall from 'assets/img/kanban/wall.jpg';
import board2 from 'assets/img/kanban/board-2.png';
import board3 from 'assets/img/kanban/board-3.png';
import board4 from 'assets/img/kanban/board-4.png';
import board5 from 'assets/img/kanban/board-5.png';
import board6 from 'assets/img/kanban/board-6.png';
// import board7 from 'assets/img/kanban/board-7.png';
import board8 from 'assets/img/kanban/board-8.png';
import board9 from 'assets/img/kanban/board-9.png';

import attachment1 from 'assets/img/kanban/a1.jpg';
import { FileAttachment } from 'components/common/AttachmentPreview';

export interface KanbanBoardTask {
  id: string;
  status: {
    label: string;
    icon: IconProp;
    color: string;
  };
  title: string;
  desctiption?: string;
  priority: 'High' | 'Low' | 'Medium';
  coverImage?: string;
  completedTasks?: number[];
  attachments?: number;
  date?: Date | string;
  members?: Member[];
}

export interface KanbanBoard {
  id: number;
  title: string;
  category: string;
  coverImage?: string;
  totalTasks: number;
  comments: number;
  deadlines: number;
  users: Member[];
}

export interface KanbanBoardItem {
  id: string;
  title: string;
  borderColor: string;
  isCollapsed?: boolean;
  tasks: KanbanBoardTask[];
}

export const kanbanBoardMembers = {
  admin: members[3],
  members: members.slice(0, 4),
  guests: members.slice(4, 8)
};

export const kanbanItems: KanbanBoardItem[] = [
  {
    id: '1',
    title: 'Unassigned',
    borderColor: '#e5780b',
    isCollapsed: true,
    tasks: [
      {
        id: '1',
        status: {
          label: 'feature',
          icon: faCheckDouble,
          color: 'primary'
        },
        title: 'Develop a new feature for the Phoenix mobile app',
        priority: 'High'
      },
      {
        id: '2',
        status: {
          label: 'Bug',
          icon: faShoppingBag,
          color: 'danger'
        },
        title:
          'Conduct user research to gather feedback on the latest product iteration',
        priority: 'Medium'
      },
      {
        id: '3',
        status: {
          label: 'Issue',
          icon: faTriangleExclamation,
          color: 'warning'
        },
        title:
          'Review and approve marketing materials for the upcoming product launch',
        priority: 'Low'
      }
    ]
  },
  {
    id: '2',
    title: 'To do',
    borderColor: '#cbd0dd',
    tasks: [
      {
        id: '4',
        status: {
          label: 'Bug',
          icon: faShoppingBag,
          color: 'danger'
        },
        title:
          'Test and debug code for the e-commerce website checkout process',
        coverImage: kanban1,
        attachments: 15,
        members: [members[2], members[3], members[7]],
        priority: 'Medium'
      },
      {
        id: '5',
        status: {
          label: 'Issue',
          icon: faTriangleExclamation,
          color: 'warning'
        },
        title: 'Write a blog post on industry trends and best practices',
        date: 'Jan 25',
        members: [members[12], members[13], members[17]],
        priority: 'High'
      }
    ]
  },
  {
    id: '3',
    title: 'Doing',
    borderColor: '#3874ff',
    tasks: [
      {
        id: '6',
        status: {
          label: 'Bug',
          icon: faShoppingBag,
          color: 'danger'
        },
        title: 'Create wireframes for a new Phoenix landing page design',
        date: 'Jan 25',
        members: [members[8], members[10]],
        priority: 'Medium'
      },
      {
        id: '7',
        status: {
          label: 'Undefined',
          icon: faSpinner,
          color: 'secondary'
        },
        title:
          'Set up and configure a new software tool for the marketing team',
        completedTasks: [34, 5],
        members: [members[11]],
        priority: 'Low'
      },
      {
        id: '8',
        status: {
          label: 'Feature',
          icon: faCheckDouble,
          color: 'primary'
        },
        title: 'Draft and send a press release to announce a new partnership',
        date: 'Feb 28',
        attachments: 15,
        priority: 'Medium'
      },
      {
        id: '9',
        status: {
          label: 'Issue',
          icon: faTriangleExclamation,
          color: 'warning'
        },
        title: 'Conduct a security audit of the Phoenix web applications',
        date: 'Mar 2',
        attachments: 15,
        coverImage: glass,
        priority: 'High'
      }
    ]
  },
  {
    id: '4',
    title: 'Review',
    borderColor: '#0097eb',
    tasks: [
      {
        id: '10',
        status: {
          label: 'Issue',
          icon: faTriangleExclamation,
          color: 'warning'
        },
        title: 'Design and develop a new logo for the Phoenix',
        attachments: 15,
        members: [members[14], members[15], members[16]],
        priority: 'Medium'
      },
      {
        id: '11',
        status: {
          label: 'Issue',
          icon: faTriangleExclamation,
          color: 'warning'
        },
        title:
          'Create a fresh visual identity for Phoenix with a new logo design',
        completedTasks: [20, 18],
        members: [members[5], members[6], members[7]],
        priority: 'Low'
      },
      {
        id: '12',
        status: {
          label: 'Undefined',
          icon: faSpinner,
          color: 'secondary'
        },
        title:
          'Identify the best software vendors for a company-wide system through comprehensive research and evaluation',
        attachments: 15,
        priority: 'High'
      },
      {
        id: '13',
        status: {
          label: 'Feature',
          icon: faCheckDouble,
          color: 'primary'
        },
        title: 'Write and edit copy for a new email marketing campaign',
        attachments: 15,
        coverImage: wall,
        priority: 'Medium'
      }
    ]
  },
  {
    id: '5',
    title: 'Release',
    borderColor: '#25b003',
    tasks: [
      {
        id: '14',
        status: {
          label: 'Feature',
          icon: faCheckDouble,
          color: 'primary'
        },
        title: 'Improve Phoenix website usability through user testing',
        attachments: 15,
        members: [members[11]],
        priority: 'High'
      },
      {
        id: '15',
        status: {
          label: 'Bug',
          icon: faShoppingBag,
          color: 'danger'
        },
        title: 'Develop and deliver a training program for new employees',
        attachments: 15,
        coverImage: home,
        members: [members[4], members[7], members[9]],
        priority: 'Low'
      },
      {
        id: '16',
        status: {
          label: 'Undefined',
          icon: faSpinner,
          color: 'secondary'
        },
        title:
          'Organize and lead a brainstorming session to generate new product ideas',
        attachments: 15,
        members: [members[12], members[13]],
        priority: 'Medium'
      }
    ]
  }
];

export const kanbanAttachments: FileAttachment[] = [
  {
    name: 'Silly_sight_1.png',
    size: '123.34 KB',
    format: 'jpg',
    preview: attachment1,
    date: '21st December, 12:56 PM'
  },
  {
    name: 'All_images.zip',
    size: '123.34 KB',
    format: 'zip',
    date: '21st December, 12:56 PM'
  }
];
export const kanbanActions = [
  {
    icon: faFileExport,
    label: 'Move'
  },
  {
    icon: faClone,
    label: 'Duplicate'
  },
  {
    icon: faShareNodes,
    label: 'Share'
  },
  {
    icon: faSquarePlus,
    label: 'Create template'
  },
  {
    icon: faArrowsUpToLine,
    label: 'Jump to top'
  },
  {
    icon: faBoxArchive,
    label: 'Move to Archive'
  },
  {
    icon: faTrashCan,
    label: 'Move to Trash'
  },
  {
    icon: faDownload,
    label: 'Print/Download'
  }
];

export const kanbanActivities = [
  {
    id: '1',
    task: '<span class="fw-bold"> Alfen Loebe </span> Moved the task <a href="#!">"the standard chunk" </a>from <span class="fw-bold">Doing</span> to <span class="fw-bold">To Do</span>',
    time: '10:41 AM',
    date: 'Aughst 7,2022',
    icon: faRandom,
    iconColor: 'warning'
  },
  {
    id: '2',
    task: '<span class="fw-bold"> Jessie Samson </span> Attached image3.png to the task <a href="#!">"the standard chunk" </a>',
    time: '10:41 AM',
    date: 'Aughst 7,2022',
    icon: faPaperclip,
    iconColor: 'info'
  },
  {
    id: '3',
    task: '<span class="fw-bold"> Alfen Loebe </span> Moved the task <a href="#!">"the standard chunk" </a>from <span class="fw-bold">Doing</span> to <span class="fw-bold">To Do</span>',
    time: '10:41 AM',
    date: 'Aughst 7,2022',
    icon: faPlus,
    iconColor: 'info'
  },
  {
    id: '4',
    task: '<span class="fw-bold"> Alfen Loebe </span> Moved the task <a href="#!">"the standard chunk" </a>from <span class="fw-bold">Doing</span> to <span class="fw-bold">To Do</span>',
    time: '10:41 AM',
    date: 'Aughst 7,2022',
    icon: faRandom,
    iconColor: 'primary'
  }
];

export const recentBoards: KanbanBoard[] = [
  {
    id: 1,
    title: 'Issue Tickets',
    category: 'Daily task',
    totalTasks: 44,
    comments: 12,
    deadlines: 3,
    users: [members[1], members[2], members[3], members[4], members[5]]
  },
  {
    id: 2,
    title: 'Falcon React',
    category: 'Production line',
    coverImage: board2,
    totalTasks: 11,
    comments: 29,
    deadlines: 9,
    users: [members[4], members[5], members[6], members[7], members[8]]
  },
  {
    id: 3,
    title: 'Rebuilding',
    category: 'Production line',
    coverImage: board3,
    totalTasks: 13,
    comments: 11,
    deadlines: 15,
    users: [members[9], members[10], members[11], members[12], members[13]]
  },
  {
    id: 4,
    title: 'ThemePro Devs',
    category: 'Project Management',
    coverImage: board4,
    totalTasks: 103,
    comments: 2,
    deadlines: 20,
    users: [members[14], members[15], members[16]]
  }
];
export const yourBoards: KanbanBoard[] = [
  {
    id: 5,
    title: 'Post Tracking',
    category: 'Deals Tracking',
    coverImage: board5,
    totalTasks: 142,
    comments: 21,
    deadlines: 100,
    users: [members[16], members[17], members[18], members[19], members[15]]
  },
  {
    id: 6,
    title: 'Automation Team',
    category: 'Remote team',
    coverImage: board6,
    totalTasks: 6,
    comments: 761,
    deadlines: 2,
    users: [members[8], members[2], members[3], members[4]]
  },
  {
    id: 7,
    title: 'Phoenix Kanban',
    category: 'Project Management',
    // boardClass: 'bg-body-secondary',
    totalTasks: 43,
    comments: 22,
    deadlines: 17,
    users: [members[7], members[8], members[9], members[10], members[11]]
  },
  {
    id: 8,
    title: 'Reconciling Backlogs',
    category: 'Meeting Agenda',
    coverImage: board8,
    totalTasks: 23,
    comments: 111,
    deadlines: 23,
    users: [members[8], members[14], members[16], members[18], members[15]]
  }
];

export const privateBoards: KanbanBoard[] = [
  {
    id: 9,
    title: 'Inventory update',
    category: 'Shipping Process',
    coverImage: board9,
    totalTasks: 68,
    comments: 31,
    deadlines: 14,
    users: [members[1], members[2], members[3], members[4], members[5]]
  }
];
