// /components/navbar/ProfileDropdown/ProfileHeader.tsx
// Purpose: Displays user profile information and status update in the dropdown

'use client';

import { FC } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ProfileHeaderProps {
  userImage?: string;
  userName: string;
  userEmail?: string;
}

export const ProfileHeader: FC<ProfileHeaderProps> = ({ 
  userImage, 
  userName,
  userEmail
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="px-4 pt-4 pb-3">
      <div className="flex flex-col items-center gap-2">
        <Avatar className="h-16 w-16">
          <AvatarImage src={userImage} alt={`${userName}'s avatar`} />
          <AvatarFallback>{getInitials(userName)}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h6 className="text-base font-medium text-foreground dark:text-white">
            {userName}
          </h6>
          {userEmail && (
            <p className="text-sm text-muted-foreground">
              {userEmail}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3">
        <Input
          placeholder="Update your status"
          className="w-full text-sm bg-muted/50 dark:bg-zinc-800 rounded-full px-4 py-2"
        />
      </div>
    </div>
  );
};