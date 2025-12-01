'use client';

import { useCallback } from 'react';
import { useChatStore } from '@/lib/stores/chat-store';
import type { ChatContext } from '@/lib/types/chat';

interface UseChatOptions {
  context?: ChatContext;
  apiEndpoint?: string;
}

export function useChat(options: UseChatOptions = {}) {
  const { context, apiEndpoint = '/api/chat' } = options;

  const {
    messages,
    isOpen,
    status,
    error,
    openChat,
    closeChat,
    toggleChat,
    addMessage,
    setStatus,
    setError,
    clearMessages,
    clearError,
  } = useChatStore();

  const sendMessage = useCallback(
    async (content: string): Promise<string | null> => {
      if (!content.trim()) return null;

      try {
        setStatus('loading');
        clearError();

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            context: context,
            history: messages.slice(-10).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const assistantMessage = data.message || data.response;

        if (assistantMessage) {
          addMessage({ role: 'assistant', content: assistantMessage });
        }

        setStatus('idle');
        return assistantMessage;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        addMessage({
          role: 'assistant',
          content: "I'm sorry, I couldn't process your request. Please try again.",
        });
        return null;
      }
    },
    [apiEndpoint, context, messages, addMessage, setStatus, setError, clearError]
  );

  return {
    messages,
    isOpen,
    status,
    error,
    isLoading: status === 'loading',
    isStreaming: status === 'streaming',
    sendMessage,
    openChat,
    closeChat,
    toggleChat,
    clearMessages,
    clearError,
  };
}

