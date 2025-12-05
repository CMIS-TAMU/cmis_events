'use client';

import { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/lib/stores/chat-store';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { MessageCircle, X, Minimize2, Trash2 } from 'lucide-react';
import type { ChatConfig, ChatContext } from '@/lib/types/chat';

interface ChatWidgetProps {
  config?: ChatConfig;
  context?: ChatContext;
  onSendMessage?: (message: string) => Promise<string | void>;
  className?: string;
}

export function ChatWidget({
  config = {},
  context,
  onSendMessage,
  className,
}: ChatWidgetProps) {
  const {
    placeholder = 'Ask me anything...',
    welcomeMessage,
    position = 'bottom-right',
  } = config;

  const {
    isOpen,
    toggleChat,
    closeChat,
    setContext,
    setStatus,
    addMessage,
    clearMessages,
    status,
  } = useChatStore();

  useEffect(() => {
    if (context) setContext(context);
  }, [context, setContext]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!onSendMessage) {
        setStatus('loading');
        await new Promise((resolve) => setTimeout(resolve, 1500));
        addMessage({
          role: 'assistant',
          content: `Thanks for your message! This is a demo response. You asked: "${message}"`,
        });
        setStatus('idle');
        return;
      }

      try {
        setStatus('loading');
        const response = await onSendMessage(message);
        if (response) {
          addMessage({ role: 'assistant', content: response });
        }
        setStatus('idle');
      } catch (error) {
        console.error('Chat error:', error);
        addMessage({
          role: 'assistant',
          content: "I'm sorry, I encountered an error. Please try again.",
        });
        setStatus('error');
      }
    },
    [onSendMessage, setStatus, addMessage]
  );

  const positionClasses = {
    'bottom-right': 'right-4 sm:right-6 bottom-4 sm:bottom-6',
    'bottom-left': 'left-4 sm:left-6 bottom-4 sm:bottom-6',
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleChat}
        className={cn(
          'fixed z-50',
          positionClasses[position],
          'w-14 h-14 rounded-full',
          'bg-gradient-to-br from-emerald-500 to-teal-600',
          'text-white shadow-lg',
          'flex items-center justify-center',
          'hover:scale-105 active:scale-95',
          'transition-all duration-300 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2',
          isOpen && 'scale-0 opacity-0 pointer-events-none',
          className
        )}
        aria-label="Open chat"
        aria-expanded={isOpen}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-25" />
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          'fixed z-50',
          positionClasses[position],
          'w-[calc(100vw-2rem)] sm:w-[380px] md:w-[420px]',
          'h-[calc(100vh-8rem)] sm:h-[600px] max-h-[calc(100vh-2rem)]',
          'bg-background border border-border rounded-2xl shadow-2xl',
          'flex flex-col overflow-hidden',
          'transition-all duration-300 ease-out',
          'origin-bottom-right',
          isOpen
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4 pointer-events-none'
        )}
        role="dialog"
        aria-label="Chat window"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-emerald-500/10 to-teal-600/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-foreground">AI Assistant</h2>
              <p className="text-xs text-muted-foreground">
                {status === 'loading' || status === 'streaming' ? 'Typing...' : 'Online'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearMessages}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                'text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors'
              )}
              aria-label="Clear chat"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={closeChat}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                'text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors hidden sm:flex'
              )}
              aria-label="Minimize chat"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={closeChat}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                'text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors'
              )}
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <ChatMessages welcomeMessage={welcomeMessage} />
        <ChatInput placeholder={placeholder} onSendMessage={handleSendMessage} />

        <div className="px-4 py-2 text-center border-t border-border bg-muted/30">
          <p className="text-[10px] text-muted-foreground">Powered by CMIS Event Management System</p>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className={cn(
            'fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden',
            'transition-opacity duration-300',
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={closeChat}
          aria-hidden="true"
        />
      )}
    </>
  );
}


