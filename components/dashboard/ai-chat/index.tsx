// /components/dashboard/ai-chat/index.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import DashboardLayout from '@/components/layout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
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
import { HiMiniPencilSquare, HiSparkles, HiUser, HiMicrophone, HiSpeakerWave } from 'react-icons/hi2';
import { ChatScopePanel } from '@/components/chat-scope/ChatScopePanel';

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
  const [chatScopeState, setChatScopeState] = useState({
    personality: 'neutral',
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
      emails: []
    },
    settings: {
      chatName: '',
      botName: '',
      textToSpeech: false,
      speechToText: false
    }
  });

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: '/api/chatAPI',
    body: { model, chatScope: chatScopeState.personality, personality: chatScopeState.personality },
  });

  const handleChatScopeChange = (newScope: Partial<typeof chatScopeState>) => {
    setChatScopeState(prev => ({ ...prev, ...newScope }));
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
    <DashboardLayout
      userDetails={props.userDetails}
      user={props.user}
      products={props.products}
      subscription={props.subscription}
      title="Chat"
      description="AI Chat"
    >
      <div className="relative flex w-full flex-col pt-[20px] md:pt-0">
        <Image
          width="340"
          height="181"
          src={theme === 'dark' ? Bgdark.src : Bg.src}
          className="absolute left-[20%] top-[50%] z-[0] w-[200px] translate-y-[-50%] md:left-[35%] lg:left-[38%] xl:left-[38%] xl:w-[350px] "
          alt=""
        />
        <div className="mx-auto flex min-h-[75vh] w-full max-w-[1000px] flex-col xl:min-h-[85vh]">
          {/* Model Selection */}
          <div className={`flex w-full flex-col ${messages.length > 0 ? 'mb-5' : 'mb-auto'}`}>
            <div className="z-[2] mx-auto mb-5 flex w-full max-w-[600px] flex-col space-y-2 rounded-md bg-zinc-100 p-4 dark:bg-zinc-800">
              <div className="flex justify-between">
                <div
                  className={`flex cursor-pointer items-center justify-center py-2 transition-all duration-75 ${
                    model === 'gpt-3.5-turbo'
                      ? 'bg-white dark:bg-zinc-950'
                      : 'transparent'
                  } h-[70xp] w-[174px] rounded-md text-base font-semibold text-foreground dark:text-white`}
                  onClick={() => setModel('gpt-3.5-turbo')}
                >
                  GPT-3.5
                </div>
                <div
                  className={`flex cursor-pointer items-center justify-center py-2 transition-colors duration-75 ${
                    model === 'gpt-4-1106-preview'
                      ? 'bg-white dark:bg-zinc-950'
                      : 'transparent'
                  } h-[70xp] w-[174px] rounded-md text-base font-semibold text-foreground dark:text-white`}
                  onClick={() => setModel('gpt-4-1106-preview')}
                >
                  GPT-4
                </div>
              </div>
            </div>
          </div>
  
          {/* Chat History */}
          <div className="mb-auto flex w-full flex-col space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
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
          <form onSubmit={handleSendMessage} className="mt-5 flex justify-end">
            <Input
              ref={inputRef}
              className="mr-2.5 h-full min-h-[54px] w-full px-5 py-5 focus:outline-0 dark:border-zinc-800 dark:placeholder:text-zinc-400"
              placeholder="Type your message here..."
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            <Button
              type="button"
              onClick={startListening}
              className="mr-2 p-2"
              disabled={isListening}
            >
              <HiMicrophone className="h-5 w-5" />
            </Button>
            <Button
              type="submit"
              className="mt-auto flex h-[unset] w-[200px] items-center justify-center rounded-md px-4 py-5 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Thinking...' : 'Submit'}
            </Button>
          </form>
  
          <div className="mt-5 flex flex-col items-center justify-center md:flex-row">
            <p className="text-center text-xs text-zinc-500 dark:text-white">
             AI may produce inaccurate information about people, places, or facts.
             Consider checking important information.
            </p>
          </div>
        </div>
  
        {/* ChatScopePanel */}
        
        {isChatScopePanelOpen && (
          <ChatScopePanel 
            isOpen={isChatScopePanelOpen} 
            onClose={() => setIsChatScopePanelOpen(false)}
            chatScope={chatScopeState}
            onChatScopeChange={handleChatScopeChange}
          />
        )}
        
        {/* Button to open ChatScopePanel */}
        <Button
          onClick={() => setIsChatScopePanelOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 transform"
        >
          Chat Scope
        </Button>
      </DashboardLayout>
  );
}