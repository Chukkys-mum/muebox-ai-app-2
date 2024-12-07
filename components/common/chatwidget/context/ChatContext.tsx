// components/chatwidget/context/ChatContext.tsx
'use client';

import {
  createContext,
  useRef,
  useState,
  useCallback
} from 'react';
import type { 
  ChatMessage, 
  ChatContextType, 
  ChatProviderProps,
  AssistantResponse
} from './types';
import { DEFAULT_CONFIG, STORAGE_KEY } from './config';
import { openAIApi } from '../api/openai';

const defaultContext: ChatContextType = {
  messages: [],
  setMessages: () => undefined,
  isOpen: false,
  setIsOpen: () => undefined,
  isLoading: false,
  setIsLoading: () => undefined,
  isTyping: false,
  error: null,
  setError: () => undefined,
  addMessage: async () => undefined,
  retryMessage: async () => undefined,
  toggleChat: () => undefined,
  getAssistant: async () => undefined,
  cleanup: async () => undefined,
  resMessage: null
};

export const ChatContext = createContext<ChatContextType>(defaultContext);
ChatContext.displayName = 'ChatContext';

export function ChatProvider({ children, config = {} }: ChatProviderProps) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resMessage, setResMessage] = useState<ChatMessage | null>(null);

  // Refs
  const assistantRef = useRef<AssistantResponse | null>(null);
  const currentThreadRef = useRef<string | null>(null);

  // Helper function to persist messages
  const persistMessages = useCallback((updatedMessages: ChatMessage[]): ChatMessage[] => {
    if (typeof window !== 'undefined' && mergedConfig.persistMessages) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
    }
    return updatedMessages;
  }, [mergedConfig.persistMessages]);

  // Get Assistant
  const getAssistant = useCallback(async () => {
    try {
      if (!assistantRef.current) {
        assistantRef.current = await openAIApi.getAssistant();
        console.log('Assistant initialized:', assistantRef.current);
      }
    } catch (error) {
      console.error('Error getting assistant:', error);
      setError('Failed to initialize assistant. Please try again.');
    }
  }, []);

  // Cleanup
  const cleanup = useCallback(async () => {
    try {
      if (currentThreadRef.current) {
        await openAIApi.deleteThread(currentThreadRef.current);
        currentThreadRef.current = null;
        console.log('Thread cleanup successful');
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
      setError('Failed to cleanup. Please try again.');
    }
  }, []);

  // Add Message
  const addMessage = useCallback(async (content: string, type: 'user' | 'bot', retryCount = 0) => {
    try {
      if (type === 'user') {
        if (!assistantRef.current) {
          throw new Error('Assistant not initialized');
        }

        const threadId = currentThreadRef.current || await openAIApi.createThread();
        currentThreadRef.current = threadId;
        
        await openAIApi.createMessage(threadId, content);
        const runResponse = await openAIApi.runAssistant(threadId, assistantRef.current.id);
        const aiResponse = await openAIApi.getMessage(threadId);
        const responseContent = aiResponse.data[0]?.content[0]?.text?.value;

        const botMessage: ChatMessage = {
          id: Date.now().toString(),
          content: responseContent || 'No response content',
          type: 'bot',
          timestamp: new Date(),
          status: 'sent',
          retryCount: 0
        };

        setResMessage(botMessage);
        setMessages(prev => persistMessages([...prev, botMessage]));
      } else {
        const message: ChatMessage = {
          id: Date.now().toString(),
          content,
          type,
          timestamp: new Date(),
          status: 'sent',
          retryCount
        };
        setMessages(prev => persistMessages([...prev, message]));
      }
    } catch (error) {
      console.error('Error creating message:', error);
      setError('Failed to process message. Please try again.');
    }
  }, [persistMessages]);

  // Retry Message
  const retryMessage = useCallback(async (messageId: string) => {
    const messageToRetry = messages.find(msg => msg.id === messageId);
    if (!messageToRetry) return;

    setMessages(prev => persistMessages(prev.filter(msg => msg.id !== messageId)));
    await addMessage(messageToRetry.content, messageToRetry.type, messageToRetry.retryCount + 1);
  }, [messages, addMessage, persistMessages]);

  // Toggle Chat
  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
    setError(null);
  }, []);

  const value: ChatContextType = {
    messages,
    setMessages,
    isOpen,
    setIsOpen,
    isLoading,
    setIsLoading,
    isTyping,
    error,
    setError,
    addMessage,
    retryMessage,
    toggleChat,
    getAssistant,
    cleanup,
    resMessage
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export default ChatContext;