// components/dashboard/ai-chat/index.tsx

'use client';

import { useState, useEffect, useRef, useContext } from 'react';
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
import { KnowledgeBaseFile } from '@/services/files/KnowledgeBaseService';
import { FileRow } from '@/types';
import { HiMiniPencilSquare, HiSparkles, HiUser, HiMicrophone, HiSpeakerWave, HiPaperAirplane, HiPaperClip, HiFaceSmile, HiCodeBracket } from 'react-icons/hi2';
import { generateChatName, requestSpeechPermissions } from '@/utils/chatUtils';
import { v4 as uuidv4 } from 'uuid';   
import {
  UserContext,
  UserDetailsContext,
  ProductsContext,
  SubscriptionContext
} from '@/context/layout';
import { ChatSidebar } from './ChatSidebar';
import { 
  Chat as ChatType,  // Rename to avoid conflict with the component
  ChatMessage, 
  ChatScope,
  ChatUser 
} from '@/types/chat';
import ChatInput from '@/components/dashboard/ai-chat/ChatInput';
import { FormEvent, KeyboardEvent, SetStateAction } from 'react';
import { Message } from 'ai';

type ProductWithPrices = Database['public']['Tables']['products']['Row'] & { prices: Database['public']['Tables']['prices']['Row'][] };
type SubscriptionWithProduct = Database['public']['Tables']['subscriptions']['Row'] & { prices: Database['public']['Tables']['prices']['Row'] & { products: Database['public']['Tables']['products']['Row'] | null } | null };

const transformMessage = (message: { id: string; role: string; content: string }) => ({
  id: message.id,
  chat_id: 'current', // You'll need to track the current chat ID
  sender_id: message.role === 'user' ? 'user' : 'assistant',
  content: message.content,
  type: 'text' as const,
  is_read: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

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

export default function Chat() {
  const user = useContext(UserContext);
  const userDetails = useContext(UserDetailsContext);
  const products = useContext(ProductsContext);
  const subscription = useContext(SubscriptionContext);

  const { theme } = useTheme();
  const [model, setModel] = useState<OpenAIModel>('gpt-3.5-turbo');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isChatScopePanelOpen, setIsChatScopePanelOpen] = useState(false);
  const [availableKnowledgeBases, setAvailableKnowledgeBases] = useState<KnowledgeBaseFile[]>([]);
  const [availableFolders, setAvailableFolders] = useState<FileRow[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [chatList, setChatList] = useState<ChatType[]>([]);
  const [chatMessagesMap, setChatMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);


  const newChat: ChatType = {
    id: uuidv4(),
    chat_type: 'ai',
    created_by_user_id: user?.id || '',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

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
      Hello! I'm ${chatScopeState.settings?.botName || 'Sofie'}, your AI assistant. You can change my name anytime, either here in the chat or in the Chat Scope settings.

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
    setChatScopeState((prev: ChatScope) => ({
      ...prev,
      ...newScope,
      context: typeof newScope.context === 'string' ? newScope.context : JSON.stringify(newScope.context),
    }));
  };

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit(e);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as FormEvent<HTMLFormElement>);
    }
  };

  const onChatSelect = (chatId: string) => {
    console.log('Selected chat:', chatId);
  };

  const onNewChat = () => {
    setChatList((prev: ChatType[]) => [...prev, newChat]);
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
    <div className="flex h-screen w-full overflow-hidden">
      {/* Chat Sidebar - Fixed width, full height */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        <ChatSidebar
          chats={chatList}
          chatScopes={Object.fromEntries(
            chatScopes.map(scope => [
              scope.value,
              {
                id: scope.value,
                name: scope.label,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as ChatScope
            ])
          )}
          messages={Object.fromEntries(
            chatList.map(chat => [
              chat.id,
              messages.map((msg: Message) => ({
                id: msg.id,
                chat_id: chat.id,
                sender_id: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content,
                type: 'text',
                is_read: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as ChatMessage))
            ])
          )}
          onSelectChat={(chatId) => {
            console.log('Selected chat:', chatId);
          }}
          onNewChat={() => {
            setChatList(prev => [...prev, newChat]);
          }}
        />
      </div>
  
      {/* Main Chat Area - Flex grow, with fixed header and footer */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Optional Chat Header */}
        <div className="flex-shrink-0 h-16 border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold">Current Chat</h2>
        </div>

        {/* Messages Container - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto space-y-4 flex flex-col-reverse">
            {/* Reverse the messages array to show newest at bottom */}
            {messages.slice().reverse().map((message: Message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[80%]">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${
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
                    className={`rounded-lg px-4 py-2 break-words ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'assistant' && (
                    <Button
                      onClick={() => speakMessage(message.content)}
                      size="icon"
                      variant="ghost"
                      className="flex-shrink-0"
                      disabled={isSpeaking}
                    >
                      <HiSpeakerWave className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="flex-shrink-0 border-t bg-white dark:bg-zinc-800 p-2">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex flex-col space-y-1">
              <div className="relative w-full">
                <Input
                  ref={inputRef}
                  className="pr-16 w-full h-8 text-xs" 
                  placeholder="How can Zach help you?"
                  value={input}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex space-x-0.5">
                  <Button type="button" onClick={startListening} disabled={isListening} size="icon" variant="ghost">
                    <HiMicrophone className="h-3 w-3" /> {/* Smaller icon */}
                  </Button>
                  <Button type="submit" disabled={isLoading} size="icon" variant="ghost">
                    <HiPaperAirplane className="h-3 w-3" /> {/* Smaller icon */}
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex space-x-0.5">
                  <Button type="button" size="icon" variant="ghost">
                    <HiPaperClip className="h-3 w-3" /> {/* Smaller icon */}
                  </Button>
                  <Button type="button" size="icon" variant="ghost">
                    <HiFaceSmile className="h-3 w-3" /> {/* Smaller icon */}
                  </Button>
                  <Button type="button" size="icon" variant="ghost">
                    <HiCodeBracket className="h-3 w-3" /> {/* Smaller icon */}
                  </Button>
                  <Button type="button" size="icon" variant="ghost">
                    <HiMiniPencilSquare className="h-3 w-3" /> {/* Smaller icon */}
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <p className="text-[8px] text-zinc-500 dark:text-zinc-400 mt-1 text-center">
                  AI may produce inaccurate information {/* Reduced font size */}
                </p>
              </div>
            </form>
          </div>
        </div>


        {/* ChatScopePanel */}
        <div className="fixed right-0 top-[100px] z-50">
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

        {/* Ensure JSX block is closed properly */}
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
    </div>
  );
}
