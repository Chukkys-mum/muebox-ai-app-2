// File: components/base/Button.tsx

import classNames from 'classnames';
import React, { PropsWithChildren, ReactElement } from 'react';
import { Button as BsButton, ButtonProps as BsButtonProps, Spinner } from 'react-bootstrap';

export type ButtonVariant =
  | ''
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'dark'
  | 'light'
  | 'link'
  | 'circle'
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-success'
  | 'outline-danger'
  | 'outline-warning'
  | 'outline-info'
  | 'outline-dark'
  | 'outline-light'
  | 'phoenix-primary'
  | 'phoenix-secondary'
  | 'phoenix-success'
  | 'phoenix-danger'
  | 'phoenix-warning'
  | 'phoenix-info'
  | 'phoenix-dark'
  | 'phoenix-light'
  | 'subtle-primary'
  | 'subtle-secondary'
  | 'subtle-success'
  | 'subtle-danger'
  | 'subtle-warning'
  | 'subtle-info'
  | 'subtle-dark'
  | 'subtle-light'
  | 'loading';

export interface ButtonProps extends BsButtonProps {
  variant?: ButtonVariant;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  loading?: boolean;
  loadingPosition?: 'start' | 'end';
  className?: string;
}

const Button = ({
  children,
  startIcon,
  endIcon,
  loading = false,
  loadingPosition = 'end',
  className,
  variant = '',
  ...rest
}: PropsWithChildren<ButtonProps>) => {
  const renderIcon = (icon: ReactElement, position: 'start' | 'end') =>
    React.cloneElement(icon, {
      className: classNames(icon.props.className, {
        'me-1': position === 'start',
        'ms-1': position === 'end'
      })
    });

  return (
    <BsButton
      variant={variant}
      type="button"
      disabled={loading}
      {...rest}
      className={classNames(className, {
        'btn-loading lh-1 d-flex align-items-center position-relative': loading
      })}
    >
      {loading && loadingPosition === 'start' && (
        <Spinner animation="border" role="status" className="me-2">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      )}
      {startIcon && renderIcon(startIcon, 'start')}

      {children}

      {endIcon && renderIcon(endIcon, 'end')}
      {loading && loadingPosition === 'end' && (
        <Spinner animation="border" role="status" className="ms-2">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      )}
    </BsButton>
  );
};

export default Button;
