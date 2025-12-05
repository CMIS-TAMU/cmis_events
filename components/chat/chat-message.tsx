'use client';

import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/lib/types/chat';
import { format } from 'date-fns';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div
        className={cn(
          'flex flex-col gap-1 max-w-[75%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
            'transition-all duration-200',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted text-foreground rounded-bl-md',
            message.isStreaming && 'animate-pulse'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="markdown-content break-words">
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      className="text-primary hover:text-primary/80 underline font-medium transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong {...props} className="font-semibold text-foreground" />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul {...props} className="list-disc list-inside space-y-1.5 my-2 ml-1" />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol {...props} className="list-decimal list-inside space-y-1.5 my-2 ml-1" />
                  ),
                  li: ({ node, ...props }) => (
                    <li {...props} className="ml-2 leading-relaxed" />
                  ),
                  p: ({ node, ...props }) => (
                    <p {...props} className="my-2 first:mt-0 last:mb-0 leading-relaxed" />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 {...props} className="font-semibold text-base mt-4 mb-2 first:mt-0 text-foreground" />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 {...props} className="font-semibold text-lg mt-4 mb-2 first:mt-0 text-foreground" />
                  ),
                  code: ({ node, ...props }) => (
                    <code {...props} className="bg-muted/50 px-1.5 py-0.5 rounded text-xs font-mono" />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote {...props} className="border-l-2 border-primary/30 pl-3 my-2 italic text-muted-foreground" />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <span className="text-[10px] text-muted-foreground px-1">
          {format(new Date(message.timestamp), 'h:mm a')}
        </span>
      </div>
    </div>
  );
}


