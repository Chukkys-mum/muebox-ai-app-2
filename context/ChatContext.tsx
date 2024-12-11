// File: context/ChatContext.tsx

import { 
  createContext, 
  useContext, 
  useReducer, 
  useCallback, 
  useEffect,
  ReactNode 
} from 'react';
import { ChatMessage, Chat, User, ChatState, ChatParticipant } from '@/types';

type ChatAction =
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<ChatMessage> } }
  | { type: 'DELETE_MESSAGE'; payload: string }
  | { type: 'SET_TYPING'; payload: { userId: string; isTyping: boolean } }
  | { type: 'SET_USER_STATUS'; payload: { userId: string; status: User['status'] } }
  | { type: 'SET_CURRENT_CHAT'; payload: Chat | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'MARK_READ'; payload: { messageId: string; userId: string } };

  interface ChatContextType {
    state: ChatState;
    sendMessage: (content: string) => Promise<void>;
    editMessage: (messageId: string, content: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    setTyping: (isTyping: boolean) => void;
    currentUser: User;
    markAsRead: (messageId: string) => void;  // Add this line
  }

const ChatContext = createContext<ChatContextType | null>(null);

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  currentUser: {} as User, // Will be set in provider
  participants: [],
  messages: [],
  isLoading: false,
  error: null,
  isTyping: false,
  hasMore: true,
  users: []
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        )
      };
    
    case 'DELETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload)
      };
    
    case 'SET_TYPING':
      return {
        ...state,
        participants: state.participants.map(p =>
          p.user_id === action.payload.userId
            ? { ...p, typing: action.payload.isTyping }
            : p
        ) as ChatParticipant[],
        isTyping: action.payload.userId === state.currentUser?.id ? action.payload.isTyping : state.isTyping
      };
    
    case 'SET_USER_STATUS':
      return {
        ...state,
        participants: state.participants.map(p =>
          p.user_id === action.payload.userId
            ? { ...p, status: action.payload.status }
            : p
        ) as ChatParticipant[]
      };
    
    case 'SET_CURRENT_CHAT':
      return { ...state, currentChat: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'MARK_READ':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.messageId
            ? { ...msg, is_read: true, read_at: new Date().toISOString() }
            : msg
        )
      };
    
    default:
      return state;
  }
}

interface ChatProviderProps {
  children: ReactNode;
  currentUser: User;
  initialChat?: Chat;
}

export function ChatProvider({ children, currentUser, initialChat }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    currentUser,
    currentChat: initialChat || null,
    chats: initialChat ? [initialChat] : [],
    users: [currentUser]
  });

  // WebSocket connection
  useEffect(() => {
    if (!state.currentChat) return;

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/chat/${state.currentChat.id}`
    );

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'message':
          dispatch({ type: 'ADD_MESSAGE', payload: data.payload });
          break;
        
        case 'message_update':
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: { id: data.payload.id, updates: data.payload }
          });
          break;
        
        case 'message_delete':
          dispatch({ type: 'DELETE_MESSAGE', payload: data.payload.id });
          break;
        
        case 'typing':
          dispatch({
            type: 'SET_TYPING',
            payload: { userId: data.payload.userId, isTyping: data.payload.isTyping }
          });
          break;
        
        case 'user_status':
          dispatch({
            type: 'SET_USER_STATUS',
            payload: { userId: data.payload.userId, status: data.payload.status }
          });
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'WebSocket connection error' });
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, [state.currentChat?.id]);

  const sendMessage = useCallback(async (content: string) => {
    if (!state.currentChat) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const message: ChatMessage = {
        id: Date.now().toString(),
        chat_id: state.currentChat.id,
        sender_id: currentUser.id,
        content,
        type: 'text',
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add missing required properties
        role: 'user',
        status: 'sent',
        sender: currentUser
      };

      dispatch({ type: 'ADD_MESSAGE', payload: message });

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to send message'
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentChat, currentUser]);

  const editMessage = useCallback(async (messageId: string, content: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: { 
          id: messageId, 
          updates: { 
            content,
            updated_at: new Date().toISOString()
          } 
        }
      });

      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('Failed to edit message');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to edit message'
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      dispatch({ type: 'DELETE_MESSAGE', payload: messageId });

      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to delete message'
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const setTyping = useCallback((isTyping: boolean) => {
    if (!state.currentChat) return;
    
    dispatch({
      type: 'SET_TYPING',
      payload: { userId: currentUser.id, isTyping }
    });
  }, [currentUser.id, state.currentChat]);

  const markAsRead = useCallback((messageId: string) => {
    dispatch({
      type: 'MARK_READ',
      payload: { messageId, userId: currentUser.id }
    });
  }, [currentUser.id]);
  
  const value: ChatContextType = {
    state,
    sendMessage,
    editMessage,
    deleteMessage,
    setTyping,
    currentUser,
    markAsRead  // Add this
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export { ChatContext };