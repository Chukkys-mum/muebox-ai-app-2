// types.ts
import { ReactNode, Dispatch, SetStateAction } from 'react';

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
  messageQueue: {
    maxSize: number;
    processDelay: number;
  };
}

export interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  currentThread: string | null;
  resMessage: ChatMessage | null;  // Changed from optional to required
}

export interface ChatActions {
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
  addMessage: (content: string) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  toggleChat: () => void;
  getAssistant: () => Promise<void>;  // Made required
  cleanup: () => Promise<void>;  // Made required
}

export interface ChatContextType extends ChatState, ChatActions {
  config?: ChatConfig;
}

export interface ChatProviderProps {
  children: ReactNode;
  config?: Partial<ChatConfig>;
}

export interface AssistantResponse {
  id: string;
  [key: string]: any;
}