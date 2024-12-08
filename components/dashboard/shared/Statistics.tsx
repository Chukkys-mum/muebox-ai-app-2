// components/dashboard/shared/Statistics.tsx
import { Card } from '@/components/ui/card';

interface StatisticsProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  info?: string;
  endContent?: React.ReactNode;
}

export default function Statistics({
  icon,
  title,
  value,
  info,
  endContent
}: StatisticsProps) {
  return (
    <Card className="flex w-full items-center justify-between rounded-md border-zinc-200 bg-clip-border p-6 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 text-4xl dark:border-zinc-800 dark:text-white">
          {icon}
        </div>
        <div>
          <h5 className="text-sm font-medium leading-5 text-foreground dark:text-white">
            {title}
          </h5>
          <p className="mt-1 text-2xl font-bold leading-6 text-foreground dark:text-white">
            {value}
          </p>
          {info && (
            <p className="mt-1 text-xs font-medium leading-5 text-zinc-500 dark:text-zinc-400">
              {info}
            </p>
          )}
        </div>
      </div>
      {endContent}
    </Card>
  );
}