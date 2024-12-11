import team32 from 'assets/img/team/32.webp';
import team35 from 'assets/img/team/35.webp';
import team57 from 'assets/img/team/57.webp';
import team58 from 'assets/img/team/58.webp';
import team59 from 'assets/img/team/59.webp';
import team31 from 'assets/img/team/31.webp';
import team33 from 'assets/img/team/33.webp';
import team34 from 'assets/img/team/34.webp';
import team29 from 'assets/img/team/29.webp';
import team3 from 'assets/img/team/3.webp';
import team25 from 'assets/img/team/25.webp';
// import { BadgeBg } from 'components/base/Badge';
import { PageBreadcrumbItem } from 'components/common/PageBreadcrumb';

export const memberBreadcrumbItems: PageBreadcrumbItem[] = [
  {
    label: 'Pages',
    url: '#!'
  },
  {
    label: 'Members',
    active: true
  }
];

export type Member = {
  avatar?: string;
  name: string;
  email: string;
  city: string;
  mobile: number | string;
  lastActive: string;
  joined: string;
};

export const members: Member[] = [
  {
    avatar: team32,
    name: 'Carry Anna',
    email: 'annac34@gmail.com',
    city: 'Budapest',
    mobile: '+912346578',
    lastActive: '34 min ago',
    joined: 'Dec 12, 12:56 PM'
  },
  {
    name: 'Milind Mikuja',
    email: 'mimiku@yahoo.com',
    mobile: '+8801564768976',
    city: 'Manchester',
    lastActive: '6 hours ago',
    joined: 'Dec 9, 2:28 PM'
  },
  {
    avatar: team35,
    name: 'Stanly Drinkwater',
    email: 'stnlwasser@hotmail.com',
    mobile: '+78675436798',
    city: 'Smallville',
    lastActive: '43 min ago',
    joined: 'Dec 4, 12:56 PM'
  },
  {
    avatar: team57,
    name: 'Josef Stravinsky',
    email: 'Josefsky@sni.it',
    mobile: '+118796567894',
    city: 'Metropolis',
    lastActive: '2 hours ago',
    joined: 'Dec 1,  4:07 AM'
  },
  {
    avatar: team58,
    name: 'Igor Borvibson',
    email: 'vibigorr@technext.it',
    mobile: '+65899655678',
    city: 'Central city',
    lastActive: '5 days ago',
    joined: 'Nov 28, 7:28 PM'
  },
  {
    avatar: team59,
    name: 'Katerina Karenin',
    email: 'karkat99@gmail.com',
    mobile: '+00564327890',
    city: 'Gotham',
    lastActive: '2 weeks ago',
    joined: 'Nov 24, 10:16 AM'
  },
  {
    name: 'Roy Anderson',
    email: 'andersonroy@netflix.chill',
    mobile: '+55890776',
    city: 'Vancouver',
    lastActive: '4 days ago',
    joined: 'Nov 18, 5:43 PM'
  },
  {
    avatar: team31,
    name: 'Martina scorcese',
    email: 'cesetina1@gmail.com',
    mobile: '+666611896',
    city: 'Viena',
    lastActive: '6 min ago',
    joined: 'Nov 18, 2:09 AM'
  },
  {
    avatar: team33,
    name: 'Luis Bunuel',
    email: 'luisuel@live.com',
    mobile: '+55786534',
    city: 'Bangalore',
    lastActive: '56 min ago',
    joined: 'Nov 16, 3:22 PM'
  },
  {
    avatar: team34,
    name: 'Jean Renoir',
    email: 'renoirjean1836@gmail.com',
    mobile: '+8801765458767',
    city: 'Chittagong',
    lastActive: 'Yesterday',
    joined: 'Nov 09, 8:49 AM'
  },
  {
    avatar: team29,
    name: 'Ricky Antony',
    email: 'ricky@example.com',
    mobile: '+2012001851',
    city: 'New Jersey',
    lastActive: '1 hour ago',
    joined: 'Oct 19, 8:00 AM'
  },
  {
    avatar: team3,
    name: 'Emma Watson',
    email: 'emma@example.com',
    mobile: '+2122288403',
    city: 'New York',
    lastActive: '6 hours ago',
    joined: 'Oct 15, 12:00 PM'
  },
  {
    name: 'Jennifer Schramm',
    email: 'jennifer@example.com',
    mobile: '+8283829631',
    city: 'Charlotte',
    lastActive: '12 hours ago',
    joined: 'Oct 12, 12:56 PM'
  },
  {
    avatar: team32,
    name: 'Raymond Mims',
    email: 'raymond@example.com',
    mobile: '+5624685646',
    city: 'Artesia',
    lastActive: '2 day ago',
    joined: 'Oct 10, 8:30 AM'
  },
  {
    avatar: team25,
    name: 'Michael Jenkins',
    email: 'jenkins@example.com',
    mobile: '+3026138829',
    city: 'Philadelphia',
    lastActive: '12 hours ago',
    joined: 'Oct 3, 8:30 AM'
  }
];
