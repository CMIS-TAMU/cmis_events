import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, ChatStatus, ChatContext } from '@/lib/types/chat';

interface ChatStore {
  messages: ChatMessage[];
  isOpen: boolean;
  status: ChatStatus;
  context: ChatContext | null;
  error: string | null;

  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setStatus: (status: ChatStatus) => void;
  setContext: (context: ChatContext) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  clearError: () => void;
}

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      isOpen: false,
      status: 'idle',
      context: null,
      error: null,

      openChat: () => set({ isOpen: true }),
      closeChat: () => set({ isOpen: false }),
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: generateId(),
              timestamp: new Date(),
            },
          ],
        })),

      updateMessage: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates } : msg
          ),
        })),

      setStatus: (status) => set({ status }),
      setContext: (context) => set({ context }),
      setError: (error) => set({ error, status: 'error' }),
      clearMessages: () => set({ messages: [] }),
      clearError: () => set({ error: null, status: 'idle' }),
    }),
    {
      name: 'cmis-chat-storage',
      partialize: (state) => ({
        messages: state.messages.slice(-50),
      }),
    }
  )
);


