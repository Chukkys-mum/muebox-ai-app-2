import Lightbox from '@/components/base/LightBox';
import useLightbox from '@/components/hooks/useLightbox';
import React from 'react';

interface MessageAttachmentsProps {
  attachments: string[];
}

const MessageAttachments: React.FC<MessageAttachmentsProps> = ({ attachments }) => {
  const { lightboxProps, openLightbox } = useLightbox(attachments);

  // Determine the width class based on the number of attachments
  const getWidthClass = () => {
    if (attachments.length === 2) return 'w-1/2';
    if (attachments.length > 2) return 'w-1/3';
    return 'w-auto';
  };

  return (
    <>
      <Lightbox {...lightboxProps} />
      <div className="flex flex-wrap gap-2 mt-2">
        {attachments.map((attachment, index) => (
          <div
            key={attachment}
            className={`${getWidthClass()} cursor-pointer`}
            onClick={() => openLightbox(index + 1)}
          >
            <img
              src={attachment}
              alt={`Attachment ${index + 1}`}
              className="rounded-md object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default MessageAttachments;
