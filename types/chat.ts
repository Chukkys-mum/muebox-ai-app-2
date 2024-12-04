// types/chat.ts

import { WithTimestamps, WithStatus, JsonB } from './common';
import { OpenAIModel } from './essay'; // Assuming we've moved OpenAIModel to essay.ts

export type ChatType = 'direct' | 'group' | 'ai';
export type AudioStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Chat Scope interface
export interface ChatScope extends WithTimestamps, WithStatus {
  id: string;
  name: string;
  initial_prompt?: string;
  context?: Record<string, any>;
  personality_profile_id?: string;
  custom_instructions?: string;
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

// Chat Body interface (for sending messages)
export interface ChatBody {
  inputMessage: string;
  model: OpenAIModel;
  apiKey?: string | undefined | null;
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

// Chat File interface
export interface ChatFile extends WithTimestamps, WithStatus {
  id: string;
  chat_id: string;
  file_type?: string;
  file_path?: string;
  uploaded_by_id: string;
}

// You can add more chat-related types or interfaces here as needed