// types/essay.ts

// OpenAI model types
export type OpenAIModel = 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-1106-preview';

// Essay types
export type EssayType = 
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

// Basic essay interface
export interface EssayBody {
  topic: string;
  words: '300' | '200';
  essayType: '' | 'Argumentative' | 'Classic' | 'Persuasive' | 'Critique';
  model: OpenAIModel;
  apiKey?: string | undefined;
}

// Premium essay interface
export interface PremiumEssayBody {
  words: string;
  topic: string;
  essayType: EssayType;
  tone: string;
  citation: string;
  level: string;
  model: OpenAIModel;
  apiKey?: string | undefined;
}

// Translation interface
export interface TranslateBody {
  // inputLanguage: string;
  // outputLanguage: string;
  topic: string;
  paragraphs: string;
  essayType: string;
  model: OpenAIModel;
  type?: 'review' | 'refactor' | 'complexity' | 'normal';
}

// Translation response interface
export interface TranslateResponse {
  code: string;
}
