// components/dashboard/ai-chat/index.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Bgdark from '@/public/img/dark/ai-chat/bg-image.png';
import Bg from '@/public/img/light/ai-chat/bg-image.png';
import { OpenAIModel } from '@/types';
import { Database } from '@/types/types_db';
import { User } from '@supabase/supabase-js';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { ChatScopePanel } from '@/components/chat-scope/ChatScopePanel';
import { ChatScope } from '@/types'; 
import { KnowledgeBaseFile } from '@/services/files/KnowledgeBaseService';
import { FileRow } from '@/types';
import DashboardLayout from '@/components/layout';
import Sidebar from '@/components/sidebar/Sidebar';
import { ChatSidebar } from '@/components/dashboard/ai-chat/ChatSidebar';
import { HiMiniPencilSquare, HiSparkles, HiUser, HiMicrophone, HiSpeakerWave, HiPaperAirplane, HiPaperClip, HiFaceSmile, HiCodeBracket } from 'react-icons/hi2';
import { generateChatName, requestSpeechPermissions } from '@/utils/chatUtils';
import { v4 as uuidv4 } from 'uuid';   

type ProductWithPrices = Database['public']['Tables']['products']['Row'] & { prices: Database['public']['Tables']['prices']['Row'][] };
type SubscriptionWithProduct = Database['public']['Tables']['subscriptions']['Row'] & { prices: Database['public']['Tables']['prices']['Row'] & { products: Database['public']['Tables']['products']['Row'] | null } | null };

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
  userDetails: { [x: string]: any } | null;
}

const chatScopes = [
  { value: 'general', label: 'General Chat' },
  { value: 'business', label: 'Business Advice' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'creative', label: 'Creative Writing' },
];

const personalities = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'humorous', label: 'Humorous' },
];

export default function Chat(props: Props) {
  const { theme } = useTheme();
  const [model, setModel] = useState<OpenAIModel>('gpt-3.5-turbo');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isChatScopePanelOpen, setIsChatScopePanelOpen] = useState(false);
  const [availableKnowledgeBases, setAvailableKnowledgeBases] = useState<KnowledgeBaseFile[]>([]);
  const [availableFolders, setAvailableFolders] = useState<FileRow[]>([]);
  const [chatScopeState, setChatScopeState] = useState<ChatScope>({
    id: '',
    name: '',
    personality_profile_id: 'neutral',
    template: '',
    context: '',
    goals: '',
    task: '',
    approach: '',
    format: '',
    length: 500,
    sources: {
      urls: [],
      files: [],
      knowledgeBases: [],
      emails: [],
      folders: [],
    },
    settings: {
      chatName: '',
      botName: 'Zach',
      textToSpeech: false,
      speechToText: false,
      llmId: 'gpt-3.5-turbo',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'active',
  });

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, setMessages } = useChat({
    api: '/api/chatAPI',
    body: { model, chatScope: chatScopeState.personality_profile_id, personality: chatScopeState.personality_profile_id },
  });

  const initializeChat = (userInput: string) => {
    const chatName = generateChatName(userInput);
    
    setChatScopeState(prev => ({
      ...prev,
      settings: {
        ...prev.settings!,
        chatName: chatName,
      }
    }));

    const botIntroduction = `
      Hello! I'm ${chatScopeState.settings?.botName || 'Zach'}, your AI assistant. You can change my name anytime, either here in the chat or in the Chat Scope settings.

      I'm here to help with anything you need—whether it's answering questions, brainstorming ideas, or tackling tasks.

      Would you like to enable speech-to-text and text-to-speech features? If so, I'll need your permission to access your microphone and speakers.

      How can I assist you today?
    `;

    setMessages([{ id: uuidv4(), role: 'assistant', content: botIntroduction }]);

    requestSpeechPermissions(handleChatScopeChange, chatScopeState);
  };

  useEffect(() => {
    const fetchKnowledgeBasesAndFolders = async () => {
      try {
        const [kbResponse, foldersResponse] = await Promise.all([
          fetch('/api/knowledgebases'),
          fetch('/api/folders')
        ]);

        if (kbResponse.ok && foldersResponse.ok) {
          const kbData = await kbResponse.json();
          const foldersData = await foldersResponse.json();
          setAvailableKnowledgeBases(kbData);
          setAvailableFolders(foldersData);
        } else {
          console.error('Error fetching knowledge bases or folders');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchKnowledgeBasesAndFolders();

    if (messages.length === 0) {
      initializeChat('');
    }
  }, []);

  const handleChatScopeChange = (newScope: Partial<ChatScope>) => {
    setChatScopeState(prev => ({
      ...prev,
      ...newScope,
      context: typeof newScope.context === 'string' ? newScope.context : JSON.stringify(newScope.context),
    }));
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit(e);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const startListening = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + transcript);
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in this browser.');
    }
  };

  return (
    <div className="flex h-screen">
      <ChatSidebar
        className="w-64 border-r"
        chats={[]} // Add your chats data here
        participants={{}}
        messages={{}}
        users={{}}
      />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } mb-4`}
            >
              <div className="flex items-end">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    message.role === 'user'
                      ? 'bg-blue-500'
                      : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  {message.role === 'user' ? (
                    <HiUser className="h-5 w-5 text-white" />
                  ) : (
                    <HiSparkles className="h-5 w-5 text-zinc-800 dark:text-white" />
                  )}
                </div>
                <div
                  className={`ml-2 rounded-lg px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                {message.role === 'assistant' && (
                  <Button
                    onClick={() => speakMessage(message.content)}
                    className="ml-2 p-2"
                    disabled={isSpeaking}
                  >
                    <HiSpeakerWave className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <Input
              ref={inputRef}
              className="flex-1"
              placeholder="Type your message here..."
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            <Button type="button" onClick={startListening} disabled={isListening}>
              <HiMicrophone className="h-5 w-5" />
            </Button>
            <Button type="button">
              <HiPaperClip className="h-5 w-5" />
            </Button>
            <Button type="button">
              <HiFaceSmile className="h-5 w-5" />
            </Button>
            <Button type="button">
              <HiCodeBracket className="h-5 w-5" />
            </Button>
            <Button type="button">
              <HiMiniPencilSquare className="h-5 w-5" />
            </Button>
            <Button type="submit" disabled={isLoading}>
              <HiPaperAirplane className="h-5 w-5" />
            </Button>
          </form>
        </div>

        <div className="p-4">
          <p className="text-center text-xs text-zinc-500 dark:text-white">
            AI may produce inaccurate information about people, places, or facts.
            Consider checking important information.
          </p>
        </div>
      </div>

      {/* ChatScopePanel */}
      <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50">
        <Button
          onClick={() => setIsChatScopePanelOpen(!isChatScopePanelOpen)}
          className={`h-32 w-8 rounded-l-md bg-[#F8F8F8] text-black hover:bg-[#F0F0F0] transition-all duration-300 ${
            isChatScopePanelOpen ? 'translate-x-[400px]' : ''
          }`}
          style={{ 
            writingMode: 'vertical-rl',
            textOrientation: 'mixed'
          }}
        >
          Chat Scope
        </Button>
      </div>
      
      {isChatScopePanelOpen && (
        <ChatScopePanel 
          isOpen={isChatScopePanelOpen} 
          onClose={() => setIsChatScopePanelOpen(false)}
          chatScope={chatScopeState}
          onChatScopeChange={handleChatScopeChange}
          availableKnowledgeBases={availableKnowledgeBases}
          availableFolders={availableFolders}
        />
      )}
    </div>
  );
}