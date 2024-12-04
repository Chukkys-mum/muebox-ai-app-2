// types/personality.ts

import { WithTimestamps, WithStatus } from './common';

// Personality Profile interface
export interface PersonalityProfile extends WithTimestamps, WithStatus {
  id: string;
  user_id: string;
  profile_name: string;
  default_tone_id?: string;
  knowledge_base_id?: string;
  role_id?: string;
  team_id?: string;
}

// Tone interface
export interface Tone extends WithTimestamps, WithStatus {
  id: string;
  name: string;
  formality_level?: number;
  emotion_level?: number;
  style?: Record<string, any>;
  tone_type?: string;
  attributes?: Record<string, any>;
}

// Personality interface
export interface Personality extends WithTimestamps, WithStatus {
  id: string;
  profile_id: string;
  name: string;
  default_tone_id?: string;
}

// Tone Analysis interface
export interface ToneAnalysis extends WithTimestamps, WithStatus {
  id: string;
  email_id: string;
  personality_id: string;
  tone_id: string;
  sentiment?: string;
  context?: string;
}

// Personality Tone interface
export interface PersonalityTone extends WithTimestamps, WithStatus {
  personality_id: string;
  tone_id: string;
}

// Personality Profile Knowledge Base interface
// This is also in personality.ts, but we'll keep it here for completeness
export interface PersonalityProfileKnowledgeBase extends WithTimestamps, WithStatus {
  profile_id: string;
  knowledge_base_id: string;
}

// You can add more personality-related types or interfaces here as needed