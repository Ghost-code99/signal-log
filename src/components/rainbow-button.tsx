'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface RainbowButtonProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  children: React.ReactNode;
}

export function RainbowButton({
  children,
  className,
  ...props
}: RainbowButtonProps) {
  return (
    <Button
      className={cn(
        'relative inline-flex h-12 overflow-hidden rounded-md p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-950',
        className
      )}
      {...props}
    >
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-slate-950 px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl dark:bg-slate-50 dark:text-black">
        {children}
      </span>
    </Button>
  );
}
