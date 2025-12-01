'use client';

import { ChatWidget } from './chat-widget';
import type { ChatConfig, ChatContext } from '@/lib/types/chat';

interface ChatProviderProps {
  context?: ChatContext;
  config?: ChatConfig;
  enabled?: boolean;
}

export function ChatProvider({
  context,
  config = {
    placeholder: 'Ask about CMIS events...',
    welcomeMessage: "Hi! 👋 I'm the CMIS Assistant. How can I help you today?",
    position: 'bottom-right',
  },
  enabled = true,
}: ChatProviderProps) {
  if (!enabled) return null;

  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context,
          history: [],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return "You're sending messages too quickly. Please wait a moment and try again.";
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Chat API error:', error);
      return "I'm sorry, I couldn't process your request. Please try again or contact cmis@tamu.edu for assistance.";
    }
  };

  return (
    <ChatWidget
      config={config}
      context={context}
      onSendMessage={handleSendMessage}
    />
  );
}
