// types/chat.ts

import { Database } from '@/types/types_db';
import { WithTimestamps, WithStatus, JsonB } from './common';
import { OpenAIModel } from './essay';
import { User } from './user';


// Enum Types
export type ChatType = 'direct' | 'group' | 'ai';
export type AudioStatus = Database['public']['Enums']['audio_status'];

export type TemplateValue = string;
export type ContextValue = JsonB | string;
export type GoalsValue = string;
export type TaskValue = string;
export type ApproachValue = string;
export type FormatValue = string;
export type LengthValue = number;

export type MessageStatus = 
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'deleted'
  | 'edited';

export type MessageType = 
  | 'text'
  | 'image'
  | 'file' 
  | 'audio'
  | 'video'
  | 'system'
  | 'event';

export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageEvent = 
  | 'join'
  | 'leave'
  | 'typing'
  | 'reaction'
  | 'pin'
  | 'unpin';

// Chat Scope interface
export interface ChatScope extends WithTimestamps, WithStatus {
  id: string;
  name: string;
  initial_prompt?: string | null;
  context?: ContextValue;
  personality_profile_id?: string | null;
  custom_instructions?: string | null;
  template?: TemplateValue;
  goals?: GoalsValue;
  task?: TaskValue;
  approach?: ApproachValue;
  format?: FormatValue;
  length?: LengthValue;
  sources: {
    urls: string[];
    files: string[];
    knowledgeBases: string[];
    emails: string[];
    folders: string[]; 
  };
  settings?: {
    chatName?: string;
    botName?: string;
    textToSpeech?: boolean;
    speechToText?: boolean;
    llmId?: string; // Changed from llmModel to llmId
  };
}

// Chat interface
export interface Chat extends WithTimestamps, WithStatus {
  id: string;
  chat_type: ChatType;
  created_by_user_id: string;
  chat_scope_id?: string;
}

// Chat Participant interface
export interface ChatParticipant extends WithStatus {
  id: string;
  chat_id: string;
  user_id: string;
  role_in_chat?: string;
  joined_at: string;
}

// Message Types
// File: types/chat.ts

export interface ChatMessage extends WithTimestamps {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  rawContent?: string;
  type: 'text' | 'audio' | 'file';
  role: MessageRole;
  status: MessageStatus;
  sender: User;
  metadata?: JsonB;
  is_read: boolean;
  read_at?: string | null;
  threadId?: string;
  thread?: MessageThread;
  replyTo?: string;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  mentions?: string[];
  editHistory?: MessageEdit[];
  isEditing?: boolean;
  isFocused?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
  readBy?: string[];
  deliveredTo?: string[];
}

// Chat Body interface (for sending messages)
export interface ChatBody {
  inputMessage: string;
  model: string;
  apiKey?: string;
  chatScope?: string;
  personality?: string;
}

// Audio Transcription interface
export interface AudioTranscription extends WithTimestamps {
  id: string;
  chat_id: string;
  user_id: string;
  audio_file_path: string;
  transcription_text?: string;
  language?: string;
  duration?: number;
  status: AudioStatus;
  metadata?: JsonB;
}

// Voice Message interface
export interface VoiceMessage extends WithTimestamps {
  id: string;
  chat_id: string;
  sender_id: string;
  audio_file_path: string;
  duration?: number;
  transcription_id?: string;
  status: AudioStatus;
}

// Chat File interface - File Related Types
export interface ChatFile extends WithTimestamps, WithStatus {
  id: string;
  chat_id: string;
  file_type?: string;
  file_path?: string;
  uploaded_by_id: string;
}

// Notification Types
export interface ChatNotification extends WithTimestamps {
  id: string;
  chat_id: string;
  user_id: string;
  message: string;
  type: string;
  is_read: boolean;
  read_at: string | null;
}

// State Management Types
export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  currentUser: User;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isTyping: boolean;
  hasMore: boolean;
  users: User[];
}


// User Context for Chat
export interface ChatUser {
  id: string;
  name: string;
  avatar?: string | null;
  status: 'online' | 'offline';
  last_seen?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  thumbnailUrl?: string;
  name: string;
  size: number;
  mimeType: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    preview?: string;
  };
}

export interface MessageThread {
  id: string;
  parentId: string;
  replyCount: number;
  lastReplyAt: string;
  participants: string[]; // user IDs
}

export interface MessageEdit {
  timestamp: string;
  content: string;
  editedBy: string; // user ID
}

// Component Props Interfaces
export interface MessageActionsProps {
  message: ChatMessage;  // Changed from Message
  currentUser: User;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onPin?: (messageId: string) => void;
  onCopy?: (messageId: string) => void;
  onForward?: (messageId: string) => void;
  variant?: 'sent' | 'received';
}

export interface MessageBoxProps {
  message: ChatMessage;  // Changed from Message
  showFormatting?: boolean;
  maxHeight?: number;
  isEditing?: boolean;
  onEditComplete?: (content: string) => void;
}

export interface MessageBoxProps {
  message: ChatMessage;  // Changed from Message
  showFormatting?: boolean;
  maxHeight?: number;
  isEditing?: boolean;
  onEditComplete?: (content: string) => void;
}

export interface LightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

// Chat Context Types
export interface ChatContextValue {
  messages: ChatMessage[];  // Changed from Message[]
  users: User[];
  currentUser: User;
  isTyping: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
}

export interface ChatContextType {
  state: ChatState;
  sendMessage: (content: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  loadMore: () => Promise<void>;
  currentUser: User;
}

export interface MessageActionProps {
  message: ChatMessage; 
  currentUser: User;
  onEdit: (event: React.MouseEvent) => void;
  onDelete: (event: React.MouseEvent) => void;
  onReply?: (event: React.MouseEvent) => void;
  onPin?: (event: React.MouseEvent) => void;
  variant?: 'sent' | 'received';
}

export interface MessageAttachmentsProps {
  attachments: MessageAttachment[];
  onImageClick?: (index: number) => void;
  onFileClick?: (attachment: MessageAttachment) => void;
  layout?: 'grid' | 'list';
}
