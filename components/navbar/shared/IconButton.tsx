// /components/navbar/shared/IconButton.tsx
// Purpose: Core button component for navbar icons with consistent styling and hover states

'use client';

import { FC, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { useTheme } from 'next-themes';

interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  className?: string;
  badge?: number;
  ariaLabel: string;
  type?: 'button' | 'submit' | 'reset';
}

export const IconButton: FC<IconButtonProps> = ({
  icon,
  onClick,
  className,
  badge,
  ariaLabel,
  type = 'button'
}) => {
  const { theme } = useTheme();
  const hoverColor = theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100';

  return (
    <Button
      type={type}
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        'relative h-9 w-9 rounded-full',
        'text-foreground dark:text-white',
        hoverColor,
        className
      )}
      aria-label={ariaLabel}
    >
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-500 text-[11px] font-medium text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Button>
  );
};