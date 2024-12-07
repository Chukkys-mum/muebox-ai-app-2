// components/chatwidget/ChatWidget.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  Send,
  MessageCircle,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { ChatErrorBoundary } from './ChatErrorBoundary';
import { AnimatePresence, motion } from 'framer-motion';
import { useChat } from '../../hooks/useChat';
import type { ChatMessage } from '../../components/chatwidget/context/types/types';
import { TypingIndicator } from './TypingIndicator';
import { Message } from './Message';


// Interfaces
interface MessageProps {
  message: ChatMessage;
}

interface ChatWindowProps {
  children?: React.ReactNode;
}

// In ChatContextType definition (e.g., context/types/types.ts):
export interface ChatContextType {
  getAssistant?: () => Promise<void>;
  cleanup?: () => Promise<void>;
  resMessage?: ChatMessage; // Add as per its use in ChatBody
}


// Message Component
const LocalMessage = ({ message }: MessageProps) => (
  <div
    className={cn(
      'message',
      'max-w-[80%] p-4 mb-3 shadow-sm',
      message.type === 'user'
        ? 'ml-auto bg-blue-500 text-white rounded-[20px]'
        : 'mr-auto bg-gray-100 text-gray-900 rounded-[20px]'
    )}
  >
    <div className="message-content whitespace-pre-wrap">{message.content}</div>
    <div className="text-xs opacity-70 mt-1">
      {new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}
    </div>
  </div>
);

// Typing Indicator Component

// Chat Header Component
const RevealDropdown = ({ children }: { children: React.ReactNode }) => (
  <div className="dropdown-menu">{children}</div>
);

const DropdownItem = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
  >
    {children}
  </button>
);

// Updated Chat Header Component
const ChatHeader = () => {
  const { toggleChat, setMessages, getAssistant, cleanup, setError, setIsLoading } = useChat();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isOpenChat, setIsOpenChat] = useState(true);

  const handleResetChat = async () => {
    try {
      setIsLoading(true);
      setMessages([]);
      await cleanup();
      console.log('Chat reset successfully');
    } catch (error) {
      console.error('Failed to reset chat:', error);
      setError('Failed to reset chat. Please try again.');
    } finally {
      setIsLoading(false);
      setDropdownOpen(false);
    }
  };

  const handleReinitializeAssistant = async () => {
    try {
      setIsLoading(true);
      await getAssistant();
      console.log('Assistant reinitialized successfully');
    } catch (error) {
      console.error('Failed to reinitialize assistant:', error);
      setError('Failed to reinitialize assistant. Please try again.');
    } finally {
      setIsLoading(false);
      setDropdownOpen(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <span className="text-lg font-medium">AI Support Assistant</span>
        <div className="w-2 h-2 rounded-full bg-green-500" />
      </div>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-md"
          aria-label="Chat options"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {dropdownOpen && (
          <div
            className={cn(
              'absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md z-50',
              'border border-gray-200 py-1'
            )}
          >
            <RevealDropdown>
              <DropdownItem>Request a callback</DropdownItem>
              <DropdownItem>Search in chat</DropdownItem>
              <DropdownItem>Show history</DropdownItem>
              <DropdownItem>Report to Admin</DropdownItem>
              <DropdownItem onClick={() => setIsOpenChat(!isOpenChat)}>
                Close Support
              </DropdownItem>
              <DropdownItem onClick={handleResetChat}>Reset Chat</DropdownItem>
              <DropdownItem onClick={handleReinitializeAssistant}>Reinitialize Assistant</DropdownItem>
            </RevealDropdown>
          </div>
        )}
      </div>
    </div>
  );
};

export {ChatHeader};


// Chat Body Component
const ChatBody = () => {
  const { messages, isTyping, resMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, resMessage]);

  return (
    <div className="h-[calc(552px-8rem)] p-6 overflow-y-auto">
      <div className="flex flex-col">
        {messages.map((message) => (
          <LocalMessage key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
        {resMessage && <LocalMessage message={resMessage} />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export {ChatBody};

// Chat Input Component
const ChatInput = () => {
  const { addMessage, isLoading, error } = useChat();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      try {
        await addMessage(inputValue.trim(), 'user');
        setInputValue('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-500"
            disabled={isLoading}
            aria-label="Chat message"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className={cn(
                'w-[37px] h-[37px] flex items-center justify-center rounded-full',
                'transition-colors',
                isLoading || !inputValue.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
      {error && (
        <p className="text-sm text-red-500 mt-2 px-4">{error}</p>
      )}
    </div>
  );
};

export {ChatInput};

// Chat Window Component
const ChatWindow = () => {
  return (
    <div
      className={cn(
        'fixed right-8 bg-white rounded-[20px] w-[446px]',
        'transform transition-all duration-300 ease-out',
        'shadow-[0px_0px_32px_0px_rgba(36,40,46,0.12)]',
        'dark:shadow-[0px_0px_32px_10px_rgba(0,0,0,0.41)]',
        'overflow-hidden z-[1045]'
      )}
      style={{ bottom: '160px' }}
    >
      <ChatHeader />
      <ChatBody />
      <ChatInput />
    </div>
  );
};

// Widget Button Component
const WidgetButton = ({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) => (
  <motion.button
    onClick={onClick}
    className={cn(
      'flex items-center justify-center gap-2',
      'w-36 h-12 bg-white hover:bg-gray-100',
      'text-gray-600 hover:text-gray-800 font-medium rounded-full',
      'transition-colors shadow-md'
    )}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    transition={{ duration: 0.2 }}
    aria-expanded={isOpen}
    aria-haspopup="dialog"
  >
    <MessageCircle className="w-5 h-5" />
    <span className="text-sm">AI Support</span>
    <div className="w-2 h-2 rounded-full bg-green-500" />
  </motion.button>
);

// Minimize Button Component
const MinimizeButton = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    onClick={onClick}
    className={cn(
      'flex items-center justify-center w-12 h-12 rounded-full',
      'bg-white hover:bg-gray-100 text-gray-600 shadow-md',
      'transition-colors fixed right-8'
    )}
    style={{ bottom: '90px' }}
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 20, opacity: 0 }}
    transition={{ duration: 0.2 }}
    aria-label="Minimize Chat"
  >
    <ChevronDown className="w-5 h-5" />
  </motion.button>
);

// Chat Window Wrapper Component
const ChatWindowWrapper = () => (
  <motion.div
    initial={{ y: 20, opacity: 0, scale: 0.95 }}
    animate={{ y: 0, opacity: 1, scale: 1 }}
    exit={{ y: 20, opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
  >
    <ChatWindow />
  </motion.div>
);

// Main ChatWidget Component
export function ChatWidget() {
  const { isOpen, toggleChat, messages } = useChat();
  const hasUnreadMessages = useRef(false);

  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'bot') {
        hasUnreadMessages.current = true;
      }
    } else {
      hasUnreadMessages.current = false;
    }
  }, [isOpen, messages]);

  return (
    <ChatErrorBoundary>
      <div 
        className="fixed z-[1045]" 
        style={{ bottom: '96px', right: '30px' }}
        role="region"
        aria-label="Chat support widget"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <>
              <ChatWindowWrapper />
              <MinimizeButton onClick={toggleChat} />
            </>
          ) : (
            <div className="relative">
              <WidgetButton onClick={toggleChat} isOpen={isOpen} />
              {hasUnreadMessages.current && (
                <motion.div
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  !
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        <div className="fixed bottom-4 right-4 text-xs text-gray-500 opacity-50">
          Press Alt + C to toggle chat
        </div>
      </div>
    </ChatErrorBoundary>
  );
}

export default ChatWidget;