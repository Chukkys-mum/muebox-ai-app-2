// File: components/modules/chat/messages/index.tsx

import classNames from 'classnames';
import Avatar from '@/components/base/Avatar';
import Lightbox from '@/components/base/LightBox';
import { Message as MessageType, User, actions } from '@/components/data/chat';
import useLightbox from '@/components/hooks/useLightbox';
import MessageActionButtons from './MessageActionButtons';
import MessageAttachments from './MessageAttachments';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import AttachmentPreview from '@/components/common/AttachmentPreview';

interface MessageProps {
  message: MessageType;
  user: User;
  showActions?: boolean;
}

const Message: React.FC<MessageProps> = ({ message, user, showActions = true }) => {
  // Filter to include only string-type images for lightbox and attachments
  const imageAttachments = (message.attachments?.images || []).filter(
    (img): img is string => typeof img === 'string'
  );
  const { lightboxProps, openLightbox } = useLightbox(imageAttachments);

  return (
    <div className="d-flex chat-message">
      <div className={classNames('d-flex flex-1', { 'justify-content-end': message.type === 'sent' })}>
        <div className={classNames('w-100', { 'w-xxl-75': showActions })}>
          <div className={classNames('d-flex hover-actions-trigger', 'flex-end-center', { 'flex-end': message.type === 'sent' })}>
            
            {message.type === 'received' && (
              <Avatar src={user.avatar} size="m" className="me-3 flex-shrink-0" />
            )}

            {message.type === 'sent' && showActions && (
              <MessageActionButtons actions={actions} variant="sent" />
            )}

            <div className={classNames(
                'chat-message-content me-2',
                { 'received': message.type === 'received' },
                { 'bg-light text-dark': message.type === 'received' },
                { 'bg-dark text-light': message.type === 'sent' }
              )}
            >
              <div className={classNames(
                  'mb-1',
                  { 'sent-message-content': message.type === 'sent' },
                  { 'received-message-content border border-translucent': message.type === 'received' },
                  { 'attachments': Boolean(imageAttachments.length) && !message.message }
                )}
              >
                {message.message && <p className="mb-0">{message.message}</p>}
                
                {imageAttachments.length > 0 && (
                  <MessageAttachments attachments={imageAttachments} />
                )}

                {message.attachments?.file && (
                  <AttachmentPreview
                    attachment={message.attachments.file}
                    variant={message.type === 'received' ? 'primary' : 'secondary'}
                  />
                )}
              </div>

              {message.type === 'received' && showActions && (
                <MessageActionButtons actions={actions.slice(1)} variant="received" />
              )}
            </div>
          </div>

          <div className={classNames(
              'd-flex gap-1 fs-10',
              { 'ms-7': message.type === 'received' },
              { 'justify-content-end': message.type === 'sent' }
            )}
          >
            <p className="mb-0 text-body-tertiary text-opacity-85 fw-semibold">
              {message.time}
            </p>
            {message.readAt && (
              <FontAwesomeIcon icon={faCheckDouble} className="text-success" />
            )}
          </div>
          
          <Lightbox {...lightboxProps} />
        </div>
      </div>
    </div>
  );
}

export default Message;
