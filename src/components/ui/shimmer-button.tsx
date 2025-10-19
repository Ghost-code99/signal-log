'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ShimmerButtonProps extends React.ComponentProps<typeof Button> {
  shimmerColor?: string;
  shimmerDuration?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ShimmerButton({
  shimmerColor = '#ffffff',
  shimmerDuration = '3s',
  className,
  children,
  ...props
}: ShimmerButtonProps) {
  return (
    <Button className={cn('relative overflow-hidden', className)} {...props}>
      <span className="relative z-10">{children}</span>
      <motion.div
        className="absolute inset-0 -translate-x-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor} 50%, transparent)`,
          opacity: 0.5,
        }}
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: parseFloat(shimmerDuration),
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </Button>
  );
}
