'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/lib/stores/chat-store';
import { ChatMessage } from './chat-message';
import { TypingIndicator } from './typing-indicator';
import { MessageSquare } from 'lucide-react';

interface ChatMessagesProps {
  className?: string;
  welcomeMessage?: string;
}

export function ChatMessages({
  className,
  welcomeMessage = "Hi there! 👋 I'm CMIS Assistant. How can I help you with events today?",
}: ChatMessagesProps) {
  const { messages, status } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, status]);

  const isTyping = status === 'loading' || status === 'streaming';

  return (
    <div
      className={cn(
        'flex-1 overflow-y-auto overflow-x-hidden',
        'px-4 py-4 space-y-4',
        'scroll-smooth',
        className
      )}
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">CMIS Event Assistant</h3>
            <p className="text-sm text-muted-foreground max-w-[250px]">{welcomeMessage}</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {['Upcoming events', 'Registration help', 'Event details'].map((suggestion) => (
              <button
                key={suggestion}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-full',
                  'bg-secondary text-secondary-foreground',
                  'hover:bg-secondary/80 transition-colors',
                  'border border-border'
                )}
                onClick={() => {
                  useChatStore.getState().addMessage({ role: 'user', content: suggestion });
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      {isTyping && (
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <span className="text-white text-xs">AI</span>
          </div>
          <TypingIndicator />
        </div>
      )}

      <div ref={messagesEndRef} className="h-px" />
    </div>
  );
}


