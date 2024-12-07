// types/chat.ts

import { Database } from '@/types/types_db';
import { WithTimestamps, WithStatus, JsonB } from './common';
import { OpenAIModel } from './essay';

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
  sources?: {
    urls: string[];
    files: string[];
    knowledgeBases: string[];
    emails: string[];
  };
  settings?: {
    chatName: string;
    botName: string;
    textToSpeech: boolean;
    speechToText: boolean;
    llmId: string; // Changed from llmModel to llmId
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
export interface ChatMessage extends WithTimestamps {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'audio' | 'file';
  metadata?: JsonB;
  is_read: boolean;
  read_at?: string | null;
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
  participants: ChatParticipant[];
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

// User Context for Chat
export interface ChatUser {
  id: string;
  name: string;
  avatar?: string | null;
  status: 'online' | 'offline';
  last_seen?: string;
}
// You can add more chat-related types or interfaces here as needed