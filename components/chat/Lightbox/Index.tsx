// File: components/chat/Lightbox/index.tsx

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { LightboxProps } from '@/types/chat';

export function Lightbox({
  images,
  initialIndex = 0,
  isOpen = false,
  onClose,
  onNext,
  onPrev
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const handlePrevious = () => {
    if (onPrev) {
      onPrev();
    } else {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape' && onClose) onClose();
  };

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose?.()}>
      <DialogContent className="max-w-full max-h-full p-0 bg-transparent border-none">
        <div className="relative flex items-center justify-center w-screen h-screen">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2"
            onClick={handleNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => onClose?.()}
          >
            <X className="h-6 w-6" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

