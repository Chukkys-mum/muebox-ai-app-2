// components/chatwidget/context/types/index.ts
import { Dispatch, SetStateAction, ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
  status: 'sending' | 'sent' | 'failed';
  retryCount: number;
}

export interface ChatConfig {
  persistMessages: boolean;
  maxRetryAttempts: number;
  typingIndicatorTimeout: number;
  keyboardShortcuts: {
    toggleChat: string[];
    closeChat: string[];
  };
}

export interface ChatContextType {
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  isTyping: boolean;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  addMessage: (content: string, type: 'user' | 'bot', retryCount?: number) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  toggleChat: () => void;
  getAssistant: () => Promise<void>;
  cleanup: () => Promise<void>;
  resMessage: ChatMessage | null;
}

export interface ChatProviderProps {
  children: ReactNode;
  config?: Partial<ChatConfig>;
}

export interface AssistantResponse {
  id: string;
  [key: string]: any;
}

// Message queue configuration
export const MESSAGE_QUEUE_CONFIG = {
  maxSize: 50,
  processDelay: 500
};
