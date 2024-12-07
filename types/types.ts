// /types/types.ts

import Stripe from 'stripe';
import { ComponentType, ReactNode } from 'react';


// Ai Essay related interfaces
export type OpenAIModel = 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-1106-preview';

export type AudioStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Add these near the top with other type definitions
export const DEFAULT_USER_CREDITS = 10;

export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted',
  PENDING: 'pending'
} as const;

export type Status = typeof STATUS[keyof typeof STATUS];

export type NewUserTrigger = {
  id: string;
  raw_user_meta_data: {
    full_name?: string;
    avatar_url?: string;
  };
}

export type RLSPolicy = {
  schema: string;
  table: string;
  name: string;
  action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  check?: string;
  using?: string;
}

export type UpdateTriggerHandler = {
  OLD: any;
  NEW: any;
  created_at: string;
  updated_at: string;
}

export type InsertTriggerHandler = {
  NEW: any;
  created_at: string;
}

export type DeleteTriggerHandler = {
  OLD: any;
  deleted_at: string;
}

export type WithTimestamps = {
  created_at: string;
  updated_at: string;
}

export type WithStatus = {
  status: Status;
}

// Add role name constants
export const ROLE_NAMES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEAM_ADMIN: 'team_admin',
  MEMBER: 'member'
} as const;

export const PERMISSION_SCHEME_NAMES = {
  SUPER_ADMIN: 'super_admin_scheme',
  ADMIN: 'admin_scheme',
  TEAM_ADMIN: 'team_admin_scheme',
  MEMBER: 'member_scheme'
} as const;

export interface TranslateBody {
  // inputLanguage: string;
  // outputLanguage: string;
  topic: string;
  paragraphs: string;
  essayType: string;
  model: OpenAIModel;
  type?: 'review' | 'refactor' | 'complexity' | 'normal';
}

export interface EssayBody {
  topic: string;
  words: '300' | '200';
  essayType: '' | 'Argumentative' | 'Classic' | 'Persuasive' | 'Critique';
  model: OpenAIModel;
  apiKey?: string | undefined;
}

export interface PremiumEssayBody {
  words: string;
  topic: string;
  essayType:
    | ''
    | 'Argumentative'
    | 'Classic'
    | 'Persuasive'
    | 'Memoir'
    | 'Critique'
    | 'Compare/Contrast'
    | 'Narrative'
    | 'Descriptive'
    | 'Expository'
    | 'Cause and Effect'
    | 'Reflective'
    | 'Informative';
  tone: string;
  citation: string;
  level: string;
  model: OpenAIModel;
  apiKey?: string | undefined;
}

export interface TranslateResponse {
  code: string;
}

export type AccountType = 'personal' | 'company';
export type ChatType = 'direct' | 'group' | 'ai';
export type EmailStatus = 'pending' | 'analyzed' | 'deleted';
export type LLMStatus = 'active' | 'deprecated' | 'testing';
export type KnowledgeBaseType = 'public' | 'private' | 'safeguard';
export type PricingPlanInterval = 'day' | 'week' | 'month' | 'year';
export type PricingType = 'one_time' | 'recurring';
export type SubscriptionStatus = 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'paused';


// Subscriptions related interfaces
export interface Customer {
  id: string /* primary key */;
  stripe_customer_id?: string;
}

export type DbTimestamptz = string; // For TIMESTAMPTZ fields
export type JsonB = Record<string, any>; // For JSONB fields

export interface Account {
  id: string;
  type: AccountType;
  name: string;
  domain?: string;
  organization_number?: string;
  tax_id?: string;
  contact_emails?: string[];
  contact_phone?: string;
  website?: string;
  billing_address?: Stripe.Address;
  payment_method?: Stripe.PaymentMethod[Stripe.PaymentMethod.Type];
  currency?: string;
  display_picture?: string;
  banner_image?: string;
  timezone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  metadata?: JsonB;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string /* primary key */;
  active?: boolean;
  name?: string;
  description?: string;
  image?: string;
  metadata?: Stripe.Metadata;
}

export interface ProductWithPrice extends Product {
  prices?: Price[];
}

export interface Price {
  id: string /* primary key */;
  product_id?: string /* foreign key to products.id */;
  active?: boolean;
  description?: string;
  unit_amount?: number;
  currency?: Currency;
  type?: Stripe.Price.Type;
  interval?: Stripe.Price.Recurring.Interval;
  interval_count?: number;
  trial_period_days?: number | null;
  metadata?: Stripe.Metadata;
  products?: Product;
}

// Add utility type
export type Currency = string & { length: 3 };

export interface PriceWithProduct extends Price {}

export interface Subscription {
  id: string;
  account_id: string;  // Changed from user_id
  status?: SubscriptionStatus;
  metadata?: JsonB;
  price_id?: string;
  quantity?: number;
  cancel_at_period_end?: boolean;
  created: DbTimestamptz;
  current_period_start: DbTimestamptz;
  current_period_end: DbTimestamptz;
  ended_at?: DbTimestamptz;
  cancel_at?: DbTimestamptz;
  canceled_at?: DbTimestamptz;
  trial_start?: DbTimestamptz;
  trial_end?: DbTimestamptz;
  prices?: Price;  // Optional relation
}

// Users and Roles related interfaces
export interface UserDetails {
  id: string /* primary key */;
  first_name: string;
  last_name: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Role extends WithTimestamps, WithStatus {
  id: string;
  name: string;
  permission_scheme_id: string;
}

export interface Team extends WithTimestamps, WithStatus {
  id: string;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PermissionScheme extends WithTimestamps, WithStatus {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, any>;
  is_super_admin: boolean;
  is_account_admin: boolean;
}

export interface User {
  id: string;
  full_name?: string;
  avatar_url?: string;
  credits?: number;
}

export interface AccountUser extends WithTimestamps, WithStatus {
  id: string;
  account_id: string;
  user_id: string;
  role_id: string;
  is_primary: boolean;
  metadata?: Record<string, any>;
}

export interface AccountTeam extends WithTimestamps, WithStatus {
  id: string;
  account_id: string;
  team_id: string;
  metadata?: Record<string, any>;
}

// AI and Chat related interfaces
export interface ChatScope extends WithTimestamps, WithStatus {
  id: string;
  name: string;
  initial_prompt?: string;
  context?: Record<string, any>;
  personality_profile_id?: string;
  custom_instructions?: string;
}

export interface Chat extends WithTimestamps, WithStatus {
  id: string;
  chat_type: ChatType;
  created_by_user_id: string;
  chat_scope_id?: string;
}

export interface ChatParticipant extends WithStatus {
  id: string;
  chat_id: string;
  user_id: string;
  role_in_chat?: string;
  joined_at: string;
}

export interface ChatBody {
  inputMessage: string;
  model: OpenAIModel;
  apiKey?: string | undefined | null;
}

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

export interface VoiceMessage extends WithTimestamps {
  id: string;
  chat_id: string;
  sender_id: string;
  audio_file_path: string;
  duration?: number;
  transcription_id?: string;
  status: AudioStatus;
}

// Personality related interfaces
export interface PersonalityProfile extends WithTimestamps, WithStatus {
  id: string;
  user_id: string;
  profile_name: string;
  default_tone_id?: string;
  knowledge_base_id?: string;
  role_id?: string;
  team_id?: string;
}

export interface Tone extends WithTimestamps, WithStatus {
  id: string;
  name: string;
  formality_level?: number;
  emotion_level?: number;
  style?: Record<string, any>;
  tone_type?: string;
  attributes?: Record<string, any>;
}

export interface Personality extends WithTimestamps, WithStatus {
  id: string;
  profile_id: string;
  name: string;
  default_tone_id?: string;
}

export interface ToneAnalysis extends WithTimestamps, WithStatus {
  id: string;
  email_id: string;
  personality_id: string;
  tone_id: string;
  sentiment?: string;
  context?: string;
}

export interface PersonalityTone extends WithTimestamps, WithStatus {
  personality_id: string;
  tone_id: string;
}

export interface PersonalityProfileKnowledgeBase extends WithTimestamps, WithStatus {
  profile_id: string;
  knowledge_base_id: string;
}

// File & Knowledgebase related interfaces
export interface ChatFile extends WithTimestamps, WithStatus {
  id: string;
  chat_id: string;
  file_type?: string;
  file_path?: string;
  uploaded_by_id: string;
}

export interface KnowledgeBase extends WithTimestamps, WithStatus {
  id: string;
  name: string;
  description?: string;
  type: KnowledgeBaseType;
  file_path?: string;
  size?: number;
}

export interface KnowledgeBaseFile extends WithTimestamps, WithStatus {
  id: string;
  knowledge_base_id: string;
  file_name: string;
  file_type?: string;
  file_path?: string;
}

export interface File extends WithTimestamps, WithStatus {
  id: string;
  related_entity_type?: string;
  related_entity_id?: string;
  file_name: string;
  file_type?: string;
  file_path?: string;
  uploaded_by: string;
  category?: string;
  extension?: string;
}

export interface FileVersion {
  id: string;
  file_id: string;
  version_number: number;
  file_path?: string;
  uploaded_by: string;
  created_at: string;
}

export interface FileSettings {
  id: number;
  max_file_size?: number;
  allowed_file_types?: string[];
  updated_at: string;
}

export interface Trash {
  id: string;
  name?: string;
  size?: number;
  user_id: string;
  deleted_at: string;
}

// Email related interfaces
export interface EmailAccount extends WithTimestamps, WithStatus {
  id: string;
  user_id: string;
  provider: string;
  email_address: string;
}

export interface Email extends WithTimestamps, WithStatus {
  id: string;
  user_id: string;
  email_account_id: string;
  subject?: string;
  sender?: string;
  recipient?: Record<string, any>;
  email_body?: string;
}

// LLM related interfaces
export interface LLMProvider extends WithTimestamps {
  id: string;
  name: string;
  contact_info?: string;
  website?: string;
}

export interface LLM extends WithTimestamps, WithStatus {
  id: string;
  name: string;
  theme?: string;
  description?: string;
  api_endpoint?: string;
  provider_id: string;
}

export interface LLMFeature extends WithTimestamps {
  id: string;
  llm_id: string;
  feature: string;
  description?: string;
}


export interface LLMUsageLog extends WithTimestamps, WithStatus {
  id: string;
  llm_id: string;
  user_id: string;
  request_payload?: Record<string, any>;
  response_payload?: Record<string, any>;
}

// Notification related interfaces

export interface Notification extends WithTimestamps, WithStatus {
  id: string;
  user_id: string;
  notification_type: string;
  message?: string;
  read_at?: string;
}

// Logs 

export interface AuditLog extends WithTimestamps {
  id: string;
  user_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, any>;
  description?: string;
}

export interface ActivityLog extends WithTimestamps {
  id: string;
  user_id: string;
  action: string;
  details?: Record<string, any>;
}

export interface LoginSession extends WithStatus {
  id: string;
  user_id: string;
  ip_address?: string;
  device?: string;
  logged_in_at: string;
  logged_out_at?: string;
}

export interface RecentDevice extends WithTimestamps {
  id: string;
  user_id: string;
  device?: string;
  ip_address?: string;
  last_used_at: string;
}

// Utility Functions and Interfaces
export interface PageMeta {
  title: string;
  description: string;
  cardImage: string;
}

export interface IRoute {
  path: string;
  name: string;
  layout?: string;
  exact?: boolean;
  component?: React.ComponentType;
  icon?: JSX.Element;
  secondary?: boolean;
  collapse?: boolean;
  items?: IRoute[];
  rightElement?: boolean;
  invisible?: boolean;
}


