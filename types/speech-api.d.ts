// /types/speech-api.d.ts

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
  }
  
  interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
  }
  
  interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
  }
  
  interface SpeechRecognitionAlternative {
    confidence: number;
    transcript: string;
  }
  
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onend: (event: Event) => void;
    onerror: (event: Event) => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onstart: (event: Event) => void;
    start(): void;
    stop(): void;
    abort(): void;
  }
  
  declare global {
    interface Window {
      SpeechRecognition?: {
        new(): SpeechRecognition;
      };
      webkitSpeechRecognition?: {
        new(): SpeechRecognition;
      };
    }
  }