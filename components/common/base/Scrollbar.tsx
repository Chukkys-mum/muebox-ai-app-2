// File: components/base/Scrollbar.tsx

import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';
import Scrollbars, { ScrollbarProps as ScrollbarsProps } from 'react-custom-scrollbars-2';

interface ScrollbarProps extends ScrollbarsProps {
  autoHide?: boolean;
  className?: string;
}

const Scrollbar = ({
  children,
  autoHide = true,
  className,
  ...rest
}: PropsWithChildren<ScrollbarProps>) => {
  const renderVerticalTrack = (props: any) => (
    <div {...props} className="track-vertical h-100 rounded" />
  );

  return (
    <Scrollbars
      autoHide={autoHide}
      renderTrackVertical={renderVerticalTrack}
      className={classNames('custom-scrollbar', className)}
      {...rest}
    >
      {children}
    </Scrollbars>
  );
};

export default Scrollbar;
