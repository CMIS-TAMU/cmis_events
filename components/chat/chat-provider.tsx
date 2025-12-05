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

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          return "You're sending messages too quickly. Please wait a moment and try again.";
        }
        // Use the error message from the API if available
        if (data.message) {
          return data.message;
        }
        if (data.error) {
          return `I encountered an error: ${data.error}. Please try again or contact cmis@tamu.edu for assistance.`;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Return the message from the API
      if (data.message) {
        return data.message;
      }

      // Fallback if no message in response
      return "I received your message but couldn't generate a response. Please try again.";
    } catch (error) {
      console.error('Chat API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide more helpful error messages
      if (errorMessage.includes('fetch')) {
        return "I'm having trouble connecting to the server. Please check your internet connection and try again.";
      }
      
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
