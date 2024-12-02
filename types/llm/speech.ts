// /types/llm/speech.ts
// Handles speech-to-text (STT) and text-to-speech (TTS) capabilities

export interface STTConfig {
    language: string;
    model: string;
    continuous: boolean;
    interimResults: boolean;
  }
  
  export interface TTSConfig {
    voice: string;
    language: string;
    pitch: number;
    rate: number;
    volume: number;
  }
  
  export interface SpeechService {
    startSTT: (config: Partial<STTConfig>) => Promise<MediaStream>;
    stopSTT: () => void;
    convertToText: (audioBlob: Blob) => Promise<string>;
    convertToSpeech: (text: string, config: Partial<TTSConfig>) => Promise<AudioBuffer>;
    isSTTSupported: () => boolean;
    isTTSSupported: () => boolean;
  }