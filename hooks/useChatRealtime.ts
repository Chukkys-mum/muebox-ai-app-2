// File: hooks/useChatRealtime.ts

import { useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import { ChatMessage, User } from '@/types';

interface ChatEvent {
  type: 'message' | 'typing' | 'read' | 'status';
  payload: any;
}

export function useChatRealtime(conversationId: string) {
  const ws = useRef<WebSocket | null>(null);
  const { 
    currentUser,
    state: { messages },
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead
  } = useChat();

  useEffect(() => {
    // Connect to WebSocket
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/chat/${conversationId}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      const chatEvent: ChatEvent = JSON.parse(event.data);
      
      switch (chatEvent.type) {
        case 'message':
          handleNewMessage(chatEvent.payload);
          break;
        case 'typing':
          handleTypingIndicator(chatEvent.payload);
          break;
        case 'read':
          handleReadReceipt(chatEvent.payload);
          break;
        case 'status':
          handleUserStatus(chatEvent.payload);
          break;
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [conversationId]);

  // Send typing indicator
  const sendTypingIndicator = (isTyping: boolean) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'typing',
        payload: {
          userId: currentUser.id,
          isTyping
        }
      }));
    }
  };

  // Handle incoming events
  const handleNewMessage = (message: ChatMessage) => {
    if (message.sender.id !== currentUser.id) {
      sendMessage(message.content);
    }
  };

  const handleTypingIndicator = (payload: { userId: string; isTyping: boolean }) => {
    // Update UI to show typing indicator
    console.log(`User ${payload.userId} is ${payload.isTyping ? 'typing' : 'not typing'}`);
  };

  const handleReadReceipt = (payload: { messageId: string; userId: string }) => {
    markAsRead(payload.messageId);
  };

  const handleUserStatus = (payload: { userId: string; status: User['status'] }) => {
    // Update user status in UI
    console.log(`User ${payload.userId} is now ${payload.status}`);
  };

  return {
    sendTypingIndicator,
    isConnected: ws.current?.readyState === WebSocket.OPEN
  };
}