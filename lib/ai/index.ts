// AI Module Exports

export { AI_CONFIGS, SYSTEM_PROMPTS, FAQ_RESPONSES, matchFAQ } from './config';
export type { AIProvider, AIConfig } from './config';

export { generateChatResponse } from './chat-service';
export type { ChatMessage, ChatContext, ChatResponse } from './chat-service';
