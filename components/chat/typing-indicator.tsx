'use client';

import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 px-4 py-3 max-w-[80px]',
        'bg-muted rounded-2xl rounded-bl-md',
        className
      )}
      role="status"
      aria-label="Assistant is typing"
    >
      <span className="sr-only">Assistant is typing</span>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={cn(
            'w-2 h-2 rounded-full bg-muted-foreground/60',
            'animate-bounce'
          )}
          style={{
            animationDelay: `${index * 150}ms`,
            animationDuration: '600ms',
          }}
        />
      ))}
    </div>
  );
}


