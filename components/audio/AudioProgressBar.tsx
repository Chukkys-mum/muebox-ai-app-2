// /components/audio/AudioProgressBar.tsx

import { cn } from '@/lib/utils';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { ComponentPropsWithoutRef, forwardRef } from 'react';

type SliderProps = ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  onValueChange?: (value: number[]) => void;
  onChange?: (value: number[]) => void;
};

const Slider = forwardRef<HTMLDivElement, SliderProps>(
  ({ className, ...props }, ref) => (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary dark:bg-zinc-900">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-7 w-7 rounded-full border-2 border-primary bg-background bg-zinc-950 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-white" />
    </SliderPrimitive.Root>
  )
);

Slider.displayName = 'Slider';

interface AudioProgressBarProps {
  duration: number;
  currentProgress: number;
  handleProgressChange: (value: number) => void;
  elapsedDisplay: string;
  durationDisplay: string;
  setCurrentProgress: (value: number) => void;
}

export default function AudioProgressBar({
  duration,
  currentProgress,
  handleProgressChange,
  elapsedDisplay,
  durationDisplay,
  setCurrentProgress,
}: AudioProgressBarProps) {
  return (
    <div className="relative left-0 right-0 flex h-1 w-full items-center">
      <p className="me-3 w-20 text-base font-medium text-zinc-500 dark:text-zinc-400 md:text-xl">
        {elapsedDisplay}
      </p>
      <SliderPrimitive.Root
        value={[currentProgress]}
        min={0}
        max={duration}
        step={0.000001}
        onValueChange={(val) => {
          setCurrentProgress(val[0]);
        }}
        className="w-[100%]"
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary dark:bg-zinc-900">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-7 w-7 rounded-full border-2 border-primary bg-background bg-zinc-950 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-white" />
      </SliderPrimitive.Root>
      <p className="ms-3 w-20 text-base font-medium text-zinc-500 dark:text-zinc-400 md:text-xl">
        {durationDisplay}
      </p>
    </div>
  );
}