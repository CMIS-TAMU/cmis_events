'use client';

/**
 * Screen Reader Only Component
 * Hides content visually but keeps it accessible to screen readers
 */

import { cn } from '@/lib/utils';

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  className?: string;
}

export function ScreenReaderOnly({ children, className }: ScreenReaderOnlyProps) {
  return (
    <span
      className={cn(
        'sr-only',
        className
      )}
    >
      {children}
    </span>
  );
}

