import image1 from 'assets/img/chat/1.png';
import image2 from 'assets/img/chat/2.png';
import image3 from 'assets/img/chat/3.png';
import image4 from 'assets/img/chat/4.png';
import image5 from 'assets/img/chat/5.png';
import image6 from 'assets/img/chat/6.png';
import image7 from 'assets/img/chat/7.png';
import image8 from 'assets/img/chat/8.png';
import image9 from 'assets/img/chat/9.png';
import image10 from 'assets/img/chat/10.png';
import image11 from 'assets/img/chat/11.png';
import image12 from 'assets/img/chat/12.png';
import image13 from 'assets/img/chat/13.png';
import image14 from 'assets/img/chat/14.png';
import team20 from 'assets/img/team/20.webp';
import team29 from 'assets/img/team/29.webp';
import team30 from 'assets/img/team/30.webp';
import team25 from 'assets/img/team/25.webp';
import team15 from 'assets/img/team/15.webp';
import team59 from 'assets/img/team/59.webp';
import team1 from 'assets/img/team/1.webp';
import team6 from 'assets/img/team/6.webp';
import team60 from 'assets/img/team/60.webp';
import team57 from 'assets/img/team/57.webp';
import { FileAttachment } from 'components/common/AttachmentPreview';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faFaceSmile,
  faPenToSquare,
  faReply,
  faShare,
  faTrash
} from '@fortawesome/free-solid-svg-icons';

export interface Message {
  id: number;
  type: 'sent' | 'received';
  message?: string;
  time: string;
  readAt: Date | string | null;
  attachments?: { images?: string[]; file?: FileAttachment };
  seen?: boolean;
}
export interface User {
  id: number;
  avatar?: string;
  status: 'online' | 'offline';
  name: string;
}
export interface Conversation {
  id: number;
  user: User;
  messages: Message[];
  unreadMessages?: number;
}

export type MessageActionType = {
  icon: IconProp;
  label: string;
};

export const supportChat: Conversation = {
  id: 1,
  user: { id: 1, avatar: team30, status: 'online', name: 'Sharuka Nijibum' },
  messages: []
};

export const suggestions: string[] = [
  'I need help with something',
  'I can’t reorder a product I previously ordered',
  'How do I place an order?',
  'My payment method not working'
];

export const conversations: Conversation[] = [
  {
    id: 1,
    user: { id: 1, avatar: team20, status: 'online', name: 'Sharuka Nijibum' },
    messages: [
      {
        id: 1,
        type: 'received',
        message:
          'Peter Piper picked a peck of pickled peppers. A peck of pickled peppers Peter Piper picked.',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 2,
        type: 'sent',
        message:
          'If Peter Piper picked a peck of pickled peppers, where’s the peck of pickled peppers Peter Piper picked?',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 3,
        type: 'sent',
        message: 'Yes, in an organization stature',
        attachments: { images: [image1] },
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 4,
        type: 'received',
        message: 'Eddie edited it.',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 5,
        type: 'sent',
        message: 'Willie’s really weary.',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 6,
        type: 'received',
        message:
          'You know New York, you need New York, you know you need a unique New York.',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 7,
        type: 'sent',
        message: 'This is a message from you',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 8,
        type: 'received',
        message:
          'I have got a date at a quarter to eight; I’ll see you at the gate, so don’t be late.',
        time: 'Yesterday, 10 AM',
        readAt: null
      }
    ],
    unreadMessages: 1
  },
  {
    id: 2,
    user: {
      id: 2,
      avatar: team29,
      status: 'offline',
      name: 'Urito Nisemuno'
    },
    messages: [
      {
        id: 1,
        type: 'received',
        message:
          'Ned Nott was shot and Sam Shott was not. So it is better to be Shott than Nott.',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 2,
        type: 'sent',
        attachments: {
          images: [
            image12,
            image13,
            image2,
            image3,
            image4,
            image5,
            image6,
            image7,
            image8,
            image9,
            image10,
            image11
          ]
        },
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 3,
        type: 'sent',
        message: 'Some say Nott was not shot. But Shott says he shot Nott.',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 4,
        type: 'received',
        message:
          'But Shott says he shot Nott. Either the shot Shott shot at Nott was not shot, Or Nott was shot.',
        time: 'Yesterday, 10 AM',
        readAt: null
      },
      {
        id: 5,
        type: 'sent',
        message: 'If the shot Shott shot shot Nott, Nott was shot.',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 6,
        type: 'received',
        message:
          'But if the shot Shott shot shot Shott, then Shott was shot, not Nott.',
        time: 'Yesterday, 10 AM',
        readAt: null
      },
      {
        id: 7,
        type: 'sent',
        message: 'However, the shot Shott shot shot not Shott, but Nott.',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 8,
        type: 'received',
        time: 'Yesterday, 10 AM',
        readAt: null,
        attachments: {
          file: {
            name: 'Unsupported file format.mad',
            size: '11.13 KB',
            date: 'Dec 2, 2011',
            format: 'mad'
          }
        }
      }
    ],
    unreadMessages: 3
  },
  {
    id: 3,
    user: {
      id: 3,
      avatar: team30,
      status: 'online',
      name: 'Xiang Ledepisipang'
    },
    messages: [
      {
        id: 1,
        type: 'received',
        message:
          'A tree-toad loved a she-toad who lived up in a tree. He was a two-toed tree-toad, but a three-toed toad was she. The two-toed tree-toad tried to win the three-toed she-toad’s heart, for the two-toed tree-toad loved the ground that the three-toed tree-toad trod. But the two-toed tree-toad tried in vain; he couldn’t please her whim. From her tree-toad bower, with her three-toed power, the she-toad vetoed him.',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      }
    ]
  },
  {
    id: 4,
    user: {
      id: 4,
      avatar: team25,
      status: 'online',
      name: 'Abshini Thipano'
    },
    messages: [
      {
        id: 1,
        type: 'received',
        message: 'Hello, I’m Doctor Triple A! How can I help?',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 2,
        type: 'received',
        message:
          'What runs, but never walks. Murmurs, but never talks. Has a bed, but never sleeps. And has a mouth, but never eats?',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 3,
        type: 'received',
        message:
          'A river. But I have a head and a tail that will never meet. Having too many of me is always a treat. What am I?',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 4,
        type: 'sent',
        message: 'A coin, or what?',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 5,
        type: 'sent',
        message:
          'Well tell me what I am if I can never be thrown but I can be caught. Ways to lose me are always being sought.',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 6,
        type: 'received',
        message:
          'A cold. But what do you throw out when you want to use it but take in when you don’t want to use it?',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 7,
        type: 'sent',
        message: 'An anchor, right?',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      }
    ],
    unreadMessages: 3
  },
  {
    id: 5,
    user: {
      id: 5,
      avatar: team15,
      status: 'online',
      name: 'Nenko Nimitanip'
    },
    messages: [
      {
        id: 1,
        type: 'sent',
        message:
          'When a doctor doctors a doctor, does the doctor doing the doctoring doctor as the doctor being doctored wants to be doctored or does the doctor doing the doctoring doctor as he wants to doctor?',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      }
    ]
  },
  {
    id: 6,
    user: {
      id: 6,
      avatar: team59,
      status: 'online',
      name: 'Shanito Bistroglini'
    },
    messages: [
      {
        id: 1,
        type: 'sent',
        message:
          'When a doctor doctors a doctor, does the doctor doing the doctoring doctor as the doctor being doctored wants to be doctored or does the doctor doing the doctoring doctor as he wants to doctor?',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 2,
        type: 'received',
        message: 'Well… check the attached file for answer, man!',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      }
    ]
  },
  {
    id: 7,
    user: {
      id: 7,
      status: 'online',
      name: 'Misthoni Trepalnano'
    },
    messages: [
      {
        id: 1,
        type: 'received',
        message:
          'Mr. See owned a saw. And Mr. Soar owned a seesaw. Now, See’s saw sawed Soar’s seesaw before Soar saw See, which made Soar sore.',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 2,
        type: 'sent',
        message:
          'Had Soar seen See’s saw before See sawed Soar’s seesaw, See’s saw would not have sawed Soar’s seesaw.',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 3,
        type: 'received',
        message:
          'So See’s saw sawed Soar’s seesaw. But it was sad to see Soar so sore just because See’s saw sawed Soar’s seesaw.',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      }
    ]
  },
  {
    id: 8,
    user: {
      id: 8,
      avatar: team1,
      status: 'online',
      name: 'Zogidi Lishang'
    },
    messages: [
      {
        id: 1,
        type: 'sent',
        message:
          'Perspicacious Polly Perkins purchased Peter’s product and peddled pickles to produce a pretty profit!',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 2,
        type: 'received',
        message:
          'I slit the sheet, the sheet I slit, and on the slitted sheet I sit.',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 3,
        type: 'sent',
        message: 'Green glass globes glow greenly.',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 4,
        type: 'sent',
        message:
          'Ingenious iguanas improvising an intricate impromptu on impossibly-impractical instruments.',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 5,
        type: 'received',
        message:
          'Brisk brave brigadiers brandished broad bright blades, blunderbusses, and bludgeons—balancing them badly.',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      }
    ]
  },
  {
    id: 9,
    user: {
      id: 9,
      avatar: team6,
      status: 'online',
      name: 'Nonteporano Lepat'
    },
    messages: [
      {
        id: 1,
        type: 'received',
        message:
          'which book do you remember to have the longest possible sentence?',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 2,
        type: 'sent',
        message: ' I dunno! Guess ‘tis not easy to read and count the words!',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 3,
        type: 'received',
        message:
          "Victor Hugo’s 'Les Miserables' contains an 823 word sentence, and hopefully no one else will write longer to break the record.",
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 4,
        type: 'sent',
        message:
          'Well… I know a uniquely long title. Do you know which has it?',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 5,
        type: 'received',
        message: 'Well…no?',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 6,
        type: 'sent',
        message:
          'The longest book title is made up of 3,777 words. I don’t wanna write it down for you, go find it!',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      }
    ]
  },
  {
    id: 10,
    user: {
      id: 10,
      avatar: team60,
      status: 'online',
      name: 'Jessica Ball'
    },
    messages: [
      {
        id: 1,
        type: 'received',
        message: 'Also, what?!',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 2,
        type: 'sent',
        message:
          'But in fact, humans are more deadly to sharks than they are to humans. Humans kill about 100 million sharks per year!',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 3,
        type: 'received',
        message:
          'Hard to believe, but true. Sharks kill an average of 5 people per year while cows kill an average of 22 people per year.',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 4,
        type: 'sent',
        message: 'Whaat?!',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 5,
        type: 'received',
        message: 'Cows kill more people than sharks!',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      }
    ]
  },
  {
    id: 11,
    user: {
      id: 11,
      avatar: team57,
      status: 'online',
      name: 'Harley Brown'
    },
    messages: [
      {
        id: 1,
        type: 'received',
        message:
          'Clouds at the centre of the Milky Way smell of rum, taste of raspberries and are packed with booze!',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 2,
        type: 'sent',
        message: 'Really?!',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 3,
        type: 'received',
        message:
          'Oh yeah! It contains enough alcohol to supply every person on the planet with 300,000 pints of beer per day for the next billion years!',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 4,
        type: 'sent',
        message:
          'And know what I heard? Neptune has only completed one orbit around the Sun since its discovery!',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 5,
        type: 'received',
        message: 'And the Sun loses a billion kilos per second.',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      },
      {
        id: 6,
        type: 'sent',
        message:
          'OMG! I should leave my dietitian and ask for some advice from the Sun God then!',
        time: 'Yesterday, 10 AM',
        readAt: new Date()
      }
    ]
  }
];

export const attachments = [
  {
    image: image2
  },
  {
    image: image3
  },
  {
    image: image4
  },
  {
    image: image5
  },
  {
    image: image6
  },
  {
    image: image7
  },
  {
    image: image8
  },
  {
    image: image9
  },
  {
    image: image10
  },
  {
    image: image11
  },
  {
    image: image12
  },
  {
    image: image13
  },
  {
    image: image14
  }
];

export const files: FileAttachment[] = [
  {
    name: 'Federico_salsaniuella_godarf_design.zip',
    size: '53.34 MB',
    date: 'Dec 8, 2011',
    format: 'zip'
  },
  {
    name: 'Restart_lyf.bat',
    size: '11.13 KB',
    date: 'Dec 2, 2011',
    format: 'bat'
  },
  {
    name: 'Fake lorem ipsum fr fr.txt',
    size: '11.13 KB',
    date: 'Dec 2, 2011',
    format: 'txt'
  },
  {
    name: 'Unsupported file format.mad',
    size: '11.13 KB',
    date: 'Dec 2, 2011',
    format: 'mad'
  }
];

export const actions: MessageActionType[] = [
  {
    icon: faTrash,
    label: 'Delete'
  },
  {
    icon: faReply,
    label: 'Reply'
  },
  {
    icon: faPenToSquare,
    label: 'Edit'
  },
  {
    icon: faShare,
    label: 'Share'
  },
  {
    icon: faFaceSmile,
    label: 'Emoji'
  }
];
