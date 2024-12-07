// File: components/common/base/Avatar.tsx

import classNames from 'classnames';
import avatar from '../../../public/img/phoenix/team/40x40/avatar.webp';
import { Children, PropsWithChildren } from 'react';

export type Size = '5xl' | '4xl' | '3xl' | '2xl' | 'xl' | 'l' | 'm' | 's';
export type Variant = 'image' | 'name' | 'emoji';
export type Rounded = 'circle' | 'square' | 'soft';
export type Status = 'online' | 'offline' | 'away' | 'do-not-disturb';

interface AvatarProps {
  size: Size;
  src?: string;
  variant?: Variant;
  rounded?: Rounded;
  status?: Status;
  placeholder?: boolean;
  thumbnail?: boolean;
  imageClassName?: string;
  className?: string;
}

interface AvatarGroupProps {
  className?: string;
  total?: number;
  size: Size;
}

const Avatar = ({
  size,
  src,
  variant = 'image',
  rounded = 'circle',
  status,
  className,
  imageClassName,
  thumbnail,
  children,
  placeholder
}: PropsWithChildren<AvatarProps>) => {
  return (
    <div
      className={classNames(className, `avatar avatar-${size}`, {
        [`status-${status}`]: status
      })}
    >
      {variant === 'image' && (
        <img
          src={typeof src === 'string' ? src : (avatar as unknown as string)} // Convert to unknown, then string
          alt="avatar"
          className={classNames(imageClassName, {
            'img-thumbnail bg-body-emphasis': thumbnail,
            'avatar-placeholder': !src || placeholder,
            'rounded-circle': rounded === 'circle',
            'rounded-soft': rounded === 'soft'
          })}
        />
      )}

      {variant === 'name' && (
        <div
          className={classNames('avatar-name', {
            'rounded-circle': rounded === 'circle',
            'rounded-soft': rounded === 'soft'
          })}
        >
          <span>{children}</span>
        </div>
      )}
      {variant === 'emoji' && (
        <div
          className={classNames('avatar-emoji', {
            'rounded-circle': rounded === 'circle',
            'rounded-soft': rounded === 'soft'
          })}
        >
          <span role="img" aria-label="Emoji">
            {children}
          </span>
        </div>
      )}
    </div>
  );
};

export const AvatarGroup = ({
  children,
  className,
  total,
  size
}: PropsWithChildren<AvatarGroupProps>) => {
  return (
    <div className={classNames(className, 'avatar-group')}>
      {children}
      {total && total > Children.count(children) && (
        <Avatar size={size} variant="name">
          +{total - Children.count(children)}
        </Avatar>
      )}
    </div>
  );
};

Avatar.Group = AvatarGroup;

export default Avatar;
