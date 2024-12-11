// components/dashboard/ai-chat/ChatSidebar.tsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Menu, User } from "lucide-react";
import { 
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { Chat, ChatParticipant, ChatMessage, ChatUser, ChatScope } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, UserCircle } from "lucide-react";

interface ChatListItemProps {
  chat: Chat;
  chatScope?: ChatScope;
  lastMessage?: ChatMessage;
  unreadCount: number;
  isActive: boolean;
  onClick: () => void;
}

const ChatListItem = ({
  chat,
  chatScope,
  lastMessage,
  unreadCount,
  isActive,
  onClick
}: ChatListItemProps) => (
  <Button
    variant="ghost"
    className={cn(
      "w-full px-4 py-3 flex items-start space-x-4 h-auto",
      isActive && "bg-accent",
      unreadCount > 0 && "font-medium"
    )}
    onClick={onClick}
  >
    <Avatar>
      <AvatarImage src={undefined} />
      <AvatarFallback>
        <User className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
    <div className="flex-1 text-left">
      <div className="flex justify-between items-center">
        <span className="font-medium">
          {chatScope?.name || `Chat ${chat.id.slice(0, 8)}`}
        </span>
        {lastMessage && (
          <span className="text-xs text-muted-foreground">
            {new Date(lastMessage.created_at).toLocaleTimeString()}
          </span>
        )}
      </div>
      {lastMessage && (
        <p className="text-sm text-muted-foreground truncate">
          {lastMessage.content}
        </p>
      )}
    </div>
    {unreadCount > 0 && (
      <Badge variant="default" className="ml-2">
        {unreadCount}
      </Badge>
    )}
  </Button>
);

interface ChatSidebarProps {
  className?: string;
  chats: Chat[];
  chatScopes: Record<string, ChatScope>;
  messages: Record<string, ChatMessage[]>;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

export function ChatSidebar({ 
  className, 
  chats,
  chatScopes,
  messages,
  onSelectChat,
  onNewChat
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  
  // In ChatSidebar component
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getLastMessage = (chatId: string) => {
    const chatMessages = messages[chatId] || [];
    return chatMessages[chatMessages.length - 1];
  };

  const getUnreadCount = (chatId: string) => {
    const chatMessages = messages[chatId] || [];
    return chatMessages.filter(msg => !msg.is_read).length;
  };

  const filteredChats = chats.filter(chat => {
    const chatScope = chatScopes[chat.chat_scope_id || ''];
    return chatScope?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Card className={cn(
      "flex flex-col h-full transition-all duration-300",
      isCollapsed ? "w-20" : "w-80",
      className
    )}>
      <CardHeader className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
  
        {!isCollapsed && (
          <>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button 
              className="w-full"
              onClick={onNewChat}
            >
              New Chat
            </Button>
          </>
        )}
      </CardHeader>
  
      <CardContent className={cn(
        "flex-1 overflow-y-auto p-0",
        isCollapsed && "px-2"
      )}>
        {filteredChats.map((chat) => (
          <div key={chat.id} className="relative group">
            {isCollapsed ? (
              // Collapsed view - Show only icons
              <Button
                variant={pathname.includes(chat.id) ? "secondary" : "ghost"}
                className="w-full h-12 p-2 mb-1"
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="relative">
                  <UserCircle className="h-6 w-6" />
                  {getUnreadCount(chat.id) > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center">
                      {getUnreadCount(chat.id)}
                    </span>
                  )}
                </div>
              </Button>
            ) : (
              // Expanded view - Show full ChatListItem
              <ChatListItem
                chat={chat}
                chatScope={chatScopes[chat.chat_scope_id || '']}
                lastMessage={getLastMessage(chat.id)}
                unreadCount={getUnreadCount(chat.id)}
                isActive={pathname.includes(chat.id)}
                onClick={() => onSelectChat(chat.id)}
              />
            )}
            
            {/* Tooltip for collapsed view */}
            {isCollapsed && (
              <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-50">
                <Card className="p-2 text-sm">
                  <p className="font-medium">{chatScopes[chat.chat_scope_id || '']?.name || 'Chat'}</p>
                  {getLastMessage(chat.id)?.content && (
                    <p className="text-muted-foreground text-xs truncate max-w-[200px]">
                      {getLastMessage(chat.id)?.content}
                    </p>
                  )}
                </Card>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}