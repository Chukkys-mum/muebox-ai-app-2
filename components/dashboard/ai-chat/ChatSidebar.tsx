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
import { Chat, ChatParticipant, ChatMessage, ChatUser } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usePathname, useRouter } from "next/navigation";

interface ChatListItemProps {
  chat: Chat;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  user: ChatUser;
  unreadCount: number;
  isActive: boolean;
  onClick: () => void;
}

const ChatListItem = ({
  chat,
  participants,
  lastMessage,
  user,
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
      <AvatarImage src={user.avatar || undefined} />
      <AvatarFallback>
        <User className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
    <div className="flex-1 text-left">
      <div className="flex justify-between items-center">
        <span className="font-medium">{user.name}</span>
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
  participants: Record<string, ChatParticipant[]>;
  messages: Record<string, ChatMessage[]>;
  users: Record<string, ChatUser>;
}

export function ChatSidebar({ 
  className, 
  chats,
  participants,
  messages,
  users 
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  const getLastMessage = (chatId: string) => {
    const chatMessages = messages[chatId] || [];
    return chatMessages[chatMessages.length - 1];
  };

  const getUnreadCount = (chatId: string) => {
    const chatMessages = messages[chatId] || [];
    return chatMessages.filter(msg => !msg.is_read).length;
  };

  const getChatUser = (chatId: string): ChatUser | undefined => {
    const chatParticipants = participants[chatId] || [];
    const otherParticipant = chatParticipants.find(p => p.user_id !== 'current-user-id');
    return otherParticipant ? users[otherParticipant.user_id] : undefined;
  };

  const filteredChats = chats.filter(chat => {
    const user = getChatUser(chat.id);
    return user?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="p-4">
        <div className="flex items-center space-x-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
            />
        </div>
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        {filteredChats.map((chat) => {
          const user = getChatUser(chat.id);
          if (!user) return null;

          return (
            <ChatListItem
              key={chat.id}
              chat={chat}
              participants={participants[chat.id] || []}
              lastMessage={getLastMessage(chat.id)}
              user={user}
              unreadCount={getUnreadCount(chat.id)}
              isActive={pathname.includes(chat.id)}
              onClick={() => router.push(`/chat/${chat.id}`)}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}