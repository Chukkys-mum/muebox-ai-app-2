//services/llm/SpeechManager.ts
//service to handle speech functionality

import { SpeechService, STTConfig, TTSConfig } from '@/types/llm/speech';

export class SpeechManager implements SpeechService {
  private recognition: any; // Web Speech API recognition instance
  private synthesis: SpeechSynthesis;
  private stream: MediaStream | null = null;

  constructor() {
    // Initialize Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
      }
      this.synthesis = window.speechSynthesis;
    }
  }

  public async startSTT(config: Partial<STTConfig>): Promise<MediaStream> {
    if (!this.isSTTSupported()) {
      throw new Error('Speech-to-text is not supported in this browser');
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });

      this.recognition.continuous = config.continuous ?? true;
      this.recognition.interimResults = config.interimResults ?? true;
      this.recognition.lang = config.language ?? 'en-US';

      this.recognition.start();

      return this.stream;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      throw error;
    }
  }

  public stopSTT(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  public async convertToText(audioBlob: Blob): Promise<string> {
    // Use OpenAI's Whisper API or another STT service
    const formData = new FormData();
    formData.append('file', audioBlob);
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
      },
      body: formData
    });

    const data = await response.json();
    return data.text;
  }

  public async convertToSpeech(text: string, config: Partial<TTSConfig>): Promise<AudioBuffer> {
    if (!this.isTTSSupported()) {
      throw new Error('Text-to-speech is not supported in this browser');
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = await this.getVoice(config.voice);
    utterance.lang = config.language ?? 'en-US';
    utterance.pitch = config.pitch ?? 1;
    utterance.rate = config.rate ?? 1;
    utterance.volume = config.volume ?? 1;

    // Return a promise that resolves when speech is complete
    return new Promise((resolve, reject) => {
      utterance.onend = () => resolve(new AudioBuffer({
        length: 1,
        numberOfChannels: 1,
        sampleRate: 44100
      }));
      utterance.onerror = reject;
      this.synthesis.speak(utterance);
    });
  }

  public isSTTSupported(): boolean {
    return !!this.recognition;
  }

  public isTTSSupported(): boolean {
    return !!this.synthesis;
  }

  private async getVoice(voiceName?: string): Promise<SpeechSynthesisVoice | null> {
    await new Promise(resolve => {
      if (this.synthesis.getVoices().length) {
        resolve(true);
      } else {
        this.synthesis.onvoiceschanged = () => resolve(true);
      }
    });

    const voices = this.synthesis.getVoices();
    if (voiceName) {
      return voices.find(voice => voice.name === voiceName) || voices[0];
    }
    return voices[0];
  }
}

// Export singleton instance
export const speechManager = new SpeechManager();