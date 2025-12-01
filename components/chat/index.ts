// Chat Components - Export all chat-related components

export { ChatWidget } from './chat-widget';
export { ChatProvider } from './chat-provider';
export { ChatMessages } from './chat-messages';
export { ChatMessage } from './chat-message';
export { ChatInput } from './chat-input';
export { TypingIndicator } from './typing-indicator';

export type {
  ChatMessage as ChatMessageType,
  ChatSession,
  ChatContext,
  ChatConfig,
  ChatStatus,
} from '@/lib/types/chat';
