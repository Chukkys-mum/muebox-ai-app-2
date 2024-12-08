// File: components/chat/MessageActionButtons.tsx

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import Button from 'components/base/Button';
import { MessageActionType } from '../../../data/chat';

interface MessageActionButtonsProps {
  actions: MessageActionType[];
  variant: 'sent' | 'received';
}

const MessageActionButtons = ({
  actions,
  variant,
}: MessageActionButtonsProps) => {
  return (
    <>
      {/* Mobile view */}
      <div className="d-sm-none hover-actions align-self-center me-2 start-0">
        <div
          className={classNames(
            'rounded-pill d-flex align-items-center border px-2 actions',
            {
              'bg-light text-dark': variant === 'received',
              'bg-dark text-light': variant === 'sent',
            }
          )}
        >
          {actions.map((action) => (
            <Button key={action.label} className="btn p-2">
              <FontAwesomeIcon
                icon={action.icon as IconProp}
                className={classNames({
                  'text-primary': variant === 'sent',
                  'text-secondary': variant === 'received',
                })}
              />
            </Button>
          ))}
        </div>
      </div>
      
      {/* Desktop view */}
      <div className="d-none d-sm-flex">
        <div className="hover-actions position-relative align-self-center">
          {actions.map((action) => (
            <Button key={action.label} className="fs-10 p-2">
              <FontAwesomeIcon
                icon={action.icon as IconProp}
                className={classNames({
                  'text-primary': variant === 'sent',
                  'text-secondary': variant === 'received',
                })}
              />
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};

export default MessageActionButtons;
