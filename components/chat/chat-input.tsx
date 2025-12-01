'use client';

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/lib/stores/chat-store';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  placeholder?: string;
  onSendMessage?: (message: string) => void;
  className?: string;
  disabled?: boolean;
}

export function ChatInput({
  placeholder = 'Type your message...',
  onSendMessage,
  className,
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { status, addMessage } = useChatStore();

  const isLoading = status === 'loading' || status === 'streaming';
  const isDisabled = disabled || isLoading || !input.trim();

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  const handleSend = useCallback(() => {
    const message = input.trim();
    if (!message || isLoading) return;

    addMessage({ role: 'user', content: message });
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    onSendMessage?.(message);
  }, [input, isLoading, addMessage, onSendMessage]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn('flex items-end gap-2 p-3 border-t border-border bg-background/95 backdrop-blur-sm', className)}>
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            adjustTextareaHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          className={cn(
            'w-full resize-none rounded-xl px-4 py-2.5',
            'bg-muted/50 border border-input',
            'text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200',
            'max-h-[120px] min-h-[44px]'
          )}
          aria-label="Chat message input"
        />
      </div>

      <button
        onClick={handleSend}
        disabled={isDisabled}
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-xl',
          'flex items-center justify-center',
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90 active:scale-95',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        )}
        aria-label="Send message"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </button>
    </div>
  );
}

