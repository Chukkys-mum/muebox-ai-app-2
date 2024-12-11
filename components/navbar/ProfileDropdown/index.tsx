// /components/navbar/ProfileDropdown/index.tsx
// Purpose: User profile dropdown with authentication integration and user settings

'use client';

import { FC } from 'react';
import { ProfileHeader } from './ProfileHeader';
import { MenuItems } from './MenuItems';
import { Footer } from './Footer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserContext } from '@/context/layout';
import { useContext } from 'react';

interface ProfileDropdownProps {
  userImage?: string;
  userName: string;
  userEmail?: string;
}

const ProfileDropdown: FC<ProfileDropdownProps> = ({
  userImage = '',
  userName = 'User',
  userEmail
}) => {
  const user = useContext(UserContext);

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-9 w-9 cursor-pointer">
          <AvatarImage src={userImage} alt={`${userName}'s avatar`} />
          <AvatarFallback>{getInitials(userName)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[280px] p-0"
      >
        <div className="bg-white rounded-lg shadow-lg border dark:bg-zinc-900 dark:border-zinc-800">
          <ProfileHeader 
            userImage={userImage}
            userName={userName}
            userEmail={userEmail}
          />
          <MenuItems />
          <Footer />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;