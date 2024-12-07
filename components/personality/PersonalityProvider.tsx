// components/personality/PersonalityProvider.tsx

"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

// Core personality settings
interface PersonalitySettings {
  assertiveness: number;
  diplomacy: number;
  verbosity: number;
  technicalDepth: number;
  emotionalIntelligence: number;
  adaptability: number;
  creativity: number;
  precision: number;
}

// Contextual behavior settings
interface ContextualBehavior {
  timeBasedAdaptation: boolean;
  topicSensitivity: number;
  urgencyResponse: number;
  recipientAwareness: number;
}

// Communication style preferences
interface CommunicationStyle {
  formalityLevel: number;
  technicalVocabulary: number;
  sentenceComplexity: number;
  exampleFrequency: number;
  analogyUsage: number;
}

// Emotion recognition settings
interface EmotionSettings {
  empathyLevel: number;
  emotionalMirroring: boolean;
  sentimentSensitivity: number;
  professionalDistance: number;
}

// Extended personality preset
interface PersonalityPreset {
  name: string;
  description: string;
  settings: PersonalitySettings;
  contextual: ContextualBehavior;
  communication: CommunicationStyle;
  emotion: EmotionSettings;
  tags: string[];
}

type PresetKey = 'professional' | 'academic' | 'casual' | 'technical' | 'creative' | 'diplomatic';

interface PersonalityContextType {
  // Current states
  currentPersonality: PersonalitySettings;
  currentContextual: ContextualBehavior;
  currentCommunication: CommunicationStyle;
  currentEmotion: EmotionSettings;
  selectedPreset: PresetKey | null;
  presets: Record<PresetKey, PersonalityPreset>;
  
  // Update functions
  updatePersonality: (settings: Partial<PersonalitySettings>) => void;
  updateContextual: (settings: Partial<ContextualBehavior>) => void;
  updateCommunication: (settings: Partial<CommunicationStyle>) => void;
  updateEmotion: (settings: Partial<EmotionSettings>) => void;
  
  // Preset management
  selectPreset: (presetName: PresetKey) => void;
  saveAsPreset: (name: PresetKey, preset: PersonalityPreset) => void;
  
  // Advanced functions
  analyzeContext: (context: string) => void;
  detectEmotion: (input: string) => void;
  getResponseStyle: () => {
    personality: PersonalitySettings;
    contextual: ContextualBehavior;
    communication: CommunicationStyle;
    emotion: EmotionSettings;
  };
}

const defaultPresets: Record<PresetKey, PersonalityPreset> = {
  professional: {
    name: 'Professional',
    description: 'Balanced formal communication for business environments',
    settings: {
      assertiveness: 7,
      diplomacy: 8,
      verbosity: 6,
      technicalDepth: 8,
      emotionalIntelligence: 7,
      adaptability: 7,
      creativity: 5,
      precision: 8
    },
    contextual: {
      timeBasedAdaptation: true,
      topicSensitivity: 8,
      urgencyResponse: 8,
      recipientAwareness: 7
    },
    communication: {
      formalityLevel: 8,
      technicalVocabulary: 7,
      sentenceComplexity: 6,
      exampleFrequency: 5,
      analogyUsage: 4
    },
    emotion: {
      empathyLevel: 7,
      emotionalMirroring: false,
      sentimentSensitivity: 6,
      professionalDistance: 7
    },
    tags: ['business', 'formal', 'professional']
  },
  academic: {
    name: 'Academic',
    description: 'Detailed, analytical communication for academic contexts',
    settings: {
      assertiveness: 6,
      diplomacy: 7,
      verbosity: 9,
      technicalDepth: 9,
      emotionalIntelligence: 5,
      adaptability: 6,
      creativity: 6,
      precision: 9
    },
    contextual: {
      timeBasedAdaptation: true,
      topicSensitivity: 9,
      urgencyResponse: 6,
      recipientAwareness: 6
    },
    communication: {
      formalityLevel: 9,
      technicalVocabulary: 9,
      sentenceComplexity: 8,
      exampleFrequency: 7,
      analogyUsage: 6
    },
    emotion: {
      empathyLevel: 5,
      emotionalMirroring: false,
      sentimentSensitivity: 4,
      professionalDistance: 8
    },
    tags: ['academic', 'research', 'analytical']
  },
  casual: {
    name: 'Casual',
    description: 'Friendly, informal communication for everyday interactions',
    settings: {
      assertiveness: 5,
      diplomacy: 6,
      verbosity: 4,
      technicalDepth: 4,
      emotionalIntelligence: 8,
      adaptability: 8,
      creativity: 7,
      precision: 5
    },
    contextual: {
      timeBasedAdaptation: true,
      topicSensitivity: 6,
      urgencyResponse: 5,
      recipientAwareness: 8
    },
    communication: {
      formalityLevel: 3,
      technicalVocabulary: 4,
      sentenceComplexity: 4,
      exampleFrequency: 8,
      analogyUsage: 8
    },
    emotion: {
      empathyLevel: 8,
      emotionalMirroring: true,
      sentimentSensitivity: 8,
      professionalDistance: 3
    },
    tags: ['casual', 'friendly', 'informal']
  },
  technical: {
    name: 'Technical',
    description: 'Precise, detailed communication for technical discussions',
    settings: {
      assertiveness: 8,
      diplomacy: 6,
      verbosity: 7,
      technicalDepth: 9,
      emotionalIntelligence: 4,
      adaptability: 5,
      creativity: 5,
      precision: 9
    },
    contextual: {
      timeBasedAdaptation: false,
      topicSensitivity: 9,
      urgencyResponse: 7,
      recipientAwareness: 5
    },
    communication: {
      formalityLevel: 8,
      technicalVocabulary: 9,
      sentenceComplexity: 7,
      exampleFrequency: 8,
      analogyUsage: 6
    },
    emotion: {
      empathyLevel: 4,
      emotionalMirroring: false,
      sentimentSensitivity: 3,
      professionalDistance: 8
    },
    tags: ['technical', 'precise', 'detailed']
  },
  creative: {
    name: 'Creative',
    description: 'Imaginative, expressive communication for creative contexts',
    settings: {
      assertiveness: 6,
      diplomacy: 7,
      verbosity: 7,
      technicalDepth: 5,
      emotionalIntelligence: 8,
      adaptability: 9,
      creativity: 9,
      precision: 6
    },
    contextual: {
      timeBasedAdaptation: true,
      topicSensitivity: 7,
      urgencyResponse: 5,
      recipientAwareness: 8
    },
    communication: {
      formalityLevel: 5,
      technicalVocabulary: 5,
      sentenceComplexity: 7,
      exampleFrequency: 9,
      analogyUsage: 9
    },
    emotion: {
      empathyLevel: 9,
      emotionalMirroring: true,
      sentimentSensitivity: 9,
      professionalDistance: 4
    },
    tags: ['creative', 'expressive', 'imaginative']
  },
  diplomatic: {
    name: 'Diplomatic',
    description: 'Tactful, balanced communication for sensitive discussions',
    settings: {
      assertiveness: 5,
      diplomacy: 9,
      verbosity: 6,
      technicalDepth: 6,
      emotionalIntelligence: 9,
      adaptability: 8,
      creativity: 6,
      precision: 7
    },
    contextual: {
      timeBasedAdaptation: true,
      topicSensitivity: 9,
      urgencyResponse: 7,
      recipientAwareness: 9
    },
    communication: {
      formalityLevel: 7,
      technicalVocabulary: 6,
      sentenceComplexity: 6,
      exampleFrequency: 6,
      analogyUsage: 7
    },
    emotion: {
      empathyLevel: 9,
      emotionalMirroring: true,
      sentimentSensitivity: 9,
      professionalDistance: 6
    },
    tags: ['diplomatic', 'tactful', 'balanced']
  }
};

const defaultContextual: ContextualBehavior = {
  timeBasedAdaptation: true,
  topicSensitivity: 5,
  urgencyResponse: 5,
  recipientAwareness: 5
};

const defaultCommunication: CommunicationStyle = {
  formalityLevel: 5,
  technicalVocabulary: 5,
  sentenceComplexity: 5,
  exampleFrequency: 5,
  analogyUsage: 5
};

const defaultEmotion: EmotionSettings = {
  empathyLevel: 5,
  emotionalMirroring: true,
  sentimentSensitivity: 5,
  professionalDistance: 5
};

const PersonalityContext = createContext<PersonalityContextType | undefined>(undefined);

export function PersonalityProvider({ children }: { children: React.ReactNode }) {
  // State management
  const [currentPersonality, setCurrentPersonality] = useState<PersonalitySettings>(
    defaultPresets.professional.settings
  );
  const [currentContextual, setCurrentContextual] = useState<ContextualBehavior>(defaultContextual);
  const [currentCommunication, setCurrentCommunication] = useState<CommunicationStyle>(defaultCommunication);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionSettings>(defaultEmotion);
  const [selectedPreset, setSelectedPreset] = useState<PresetKey | null>('professional');
  const [presets, setPresets] = useState<Record<PresetKey, PersonalityPreset>>(defaultPresets);

  // Update functions
  const updatePersonality = (settings: Partial<PersonalitySettings>) => {
    setCurrentPersonality(prev => ({ ...prev, ...settings }));
    setSelectedPreset(null);
  };

  const updateContextual = (settings: Partial<ContextualBehavior>) => {
    setCurrentContextual(prev => ({ ...prev, ...settings }));
  };

  const updateCommunication = (settings: Partial<CommunicationStyle>) => {
    setCurrentCommunication(prev => ({ ...prev, ...settings }));
  };

  const updateEmotion = (settings: Partial<EmotionSettings>) => {
    setCurrentEmotion(prev => ({ ...prev, ...settings }));
  };

  // Preset management
  const selectPreset = (presetName: PresetKey) => {
    if (presets[presetName]) {
      const preset = presets[presetName];
      setCurrentPersonality(preset.settings);
      setCurrentContextual(preset.contextual);
      setCurrentCommunication(preset.communication);
      setCurrentEmotion(preset.emotion);
      setSelectedPreset(presetName);
    }
  };

  const saveAsPreset = (name: PresetKey, preset: PersonalityPreset) => {
    setPresets(prev => ({
      ...prev,
      [name]: preset
    }));
  };

  // Context analysis
  const analyzeContext = (context: string) => {
    // Implement context analysis logic
    console.log('Analyzing context:', context);
  };

  // Emotion detection
  const detectEmotion = (input: string) => {
    // Implement emotion detection logic
    console.log('Detecting emotion:', input);
  };

  // Get current response style
  const getResponseStyle = () => ({
    personality: currentPersonality,
    contextual: currentContextual,
    communication: currentCommunication,
    emotion: currentEmotion
  });

  return (
    <PersonalityContext.Provider
      value={{
        currentPersonality,
        currentContextual,
        currentCommunication,
        currentEmotion,
        selectedPreset,
        presets,
        updatePersonality,
        updateContextual,
        updateCommunication,
        updateEmotion,
        selectPreset,
        saveAsPreset,
        analyzeContext,
        detectEmotion,
        getResponseStyle
      }}
    >
      {children}
    </PersonalityContext.Provider>
  );
}

export const usePersonality = () => {
  const context = useContext(PersonalityContext);
  if (context === undefined) {
    throw new Error('usePersonality must be used within a PersonalityProvider');
  }
  return context;
};