// components/chatwidget/context/config.ts
import { ChatConfig } from './types';

export const DEFAULT_CONFIG: ChatConfig = {
  persistMessages: true,
  maxRetryAttempts: 3,
  typingIndicatorTimeout: 1500,
  keyboardShortcuts: {
    toggleChat: ['alt', 'c'],
    closeChat: ['escape']
  }
};

export const STORAGE_KEY = 'chat_messages';
export const RETRY_DELAY = 2000;

// Message queue configuration can be kept as separate constants
export const MESSAGE_QUEUE_CONFIG = {
  maxSize: 50,
  processDelay: 500
};