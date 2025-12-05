'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ErrorMessageProps {
  id?: string;
  error?: string;
  className?: string;
}

/**
 * Accessible error message component
 * Links to form fields via aria-describedby
 */
export function ErrorMessage({ id, error, className }: ErrorMessageProps) {
  const errorId = id || React.useId();
  
  if (!error) return null;

  return (
    <p
      id={errorId}
      className={cn('text-sm text-destructive', className)}
      role="alert"
      aria-live="polite"
    >
      {error}
    </p>
  );
}

