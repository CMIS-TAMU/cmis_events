// Chat Types and Interfaces

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  metadata?: ChatMessageMetadata;
}

export interface ChatMessageMetadata {
  cached?: boolean;
  tokensUsed?: number;
  escalated?: boolean;
  eventId?: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  eventId?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatContext {
  eventId?: string;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
  eventDescription?: string;
  registrationDeadline?: string;
}

export interface ChatConfig {
  placeholder?: string;
  welcomeMessage?: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'light' | 'dark' | 'auto';
}

export type ChatStatus = 'idle' | 'loading' | 'streaming' | 'error';

// Escalation types
export interface ChatEscalation {
  id: string;
  chatMessageId: string;
  userId?: string;
  reason: string;
  status: 'pending' | 'in_progress' | 'resolved';
  assignedTo?: string;
  resolvedAt?: Date;
  notes?: string;
  createdAt: Date;
}

// Escalation trigger keywords (these are checked as substrings in lowercase)
export const ESCALATION_KEYWORDS = [
  'speak to a human',
  'speak to human',
  'talk to a human',
  'talk to someone',
  'talk to a person',
  'contact support',
  'real person',
  'human support',
  'human agent',
  'help desk',
  'urgent issue',
  'not helpful',
  'need help urgently',
  'escalate',
  'customer service',
  'live support',
  'speak with someone',
] as const;
