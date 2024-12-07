import { RiCheckboxCircleLine } from "react-icons/ri";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { Dropdown } from 'react-bootstrap';
import Avatar from './base/Avatar';

// Interface for Notification
export interface Notification {
  id: string;
  user_id: string;
  notification_type?: string;
  title: string;
  message: string;
  created_at: Date;
  read_at?: Date | null;
}

// Props for NotificationItem Component
export interface NotificationItemProps {
  notification: Notification;
  type: 'dropdownItem' | 'pageItem';
  onMarkAsRead?: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  type,
  onMarkAsRead
}) => {
  const isPageItem = type === 'pageItem';
  const isRead = !!notification.read_at;

  // Container classes based on read status, page type, and theme
  const containerClasses = classNames(
    'notification-card py-3 px-4 rounded-lg border',
    {
      'bg-light-mode': isRead, // Placeholder for light mode background when read
      'bg-dark-mode': !isRead, // Placeholder for dark mode background when unread
      unread: !isRead,
      'px-4 px-lg-6': isPageItem,
      'px-2 px-sm-3': !isPageItem
    }
  );

  // Styling for text content
  const detailTextClasses = classNames('flex-1', {
    'me-sm-3': !isPageItem,
    'mt-2 me-2': isPageItem
  });

  return (
    <div className={containerClasses}>
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex">
          <Avatar src="" placeholder={true} size={isPageItem ? 'xl' : 'm'} className="me-3 status-online" />
          <div className={detailTextClasses}>
            <h4 className="fs-9 text-body-emphasis">{notification.title}</h4>
            <p className="fs-9 text-body-highlight mb-2 fw-normal">{notification.message}</p>
            <p className="text-body-secondary fs-9 mb-0">
              <FontAwesomeIcon icon={faClock} className="me-1" />
              {notification.created_at.toLocaleTimeString()} - {notification.created_at.toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="d-flex align-items-center">
          {/* Check Circle Icon */}
          <RiCheckboxCircleLine
            className={isRead ? 'text-success cursor-pointer' : 'text-muted cursor-pointer'}
            onClick={() => onMarkAsRead && onMarkAsRead(notification.id)}
          />
          {/* Dropdown Menu for Actions - Only shown on Page View */}
          {isPageItem && (
            <Dropdown>
              <Dropdown.Toggle variant="link" className="notification-dropdown-toggle">
                Actions
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => onMarkAsRead && onMarkAsRead(notification.id)}>
                  Mark as {isRead ? 'unread' : 'read'}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;