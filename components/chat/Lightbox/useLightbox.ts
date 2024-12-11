// File: components/chat/Lightbox/useLightbox.ts

import { useState, useCallback } from 'react';
import { LightboxProps } from '@/types/chat';

export function useLightbox(images: string[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
  }, []);

  const lightboxProps: LightboxProps = {
    images,
    initialIndex: currentIndex,
    isOpen,
    onClose: closeLightbox,
    onNext: () => setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0)),
    onPrev: () => setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))
  };

  return {
    openLightbox,
    closeLightbox,
    lightboxProps
  };
}

export default useLightbox;