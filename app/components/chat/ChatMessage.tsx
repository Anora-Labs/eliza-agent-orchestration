"use client";

import { Markdown } from "@/components/prompt-kit/markdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: 'user' | 'wei';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isWei = message.sender === 'wei';
  
  return (
    <div className={cn(
      "flex items-start gap-2 mb-4",
      isWei ? "justify-start" : "justify-end"
    )}>
      {isWei && (
        <Avatar className="h-8 w-8 mt-0.5 bg-gradient-to-br from-pink-500 to-rose-500">
          <AvatarImage src="/wei-icon.png" alt="Wei Icon" />
          <AvatarFallback>WEI</AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
          "px-4 py-2 rounded-xl max-w-[80%]",
          isWei 
          ? "bg-muted text-foreground" 
          : "bg-primary text-primary-foreground"
      )}>
        <div className="text-sm break-words">
          <Markdown>{message.content}</Markdown>
        </div>
        <span className="text-[10px] opacity-70 mt-1 block text-left">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
      
      {!isWei && (
        <Avatar className="h-8 w-8 mt-0.5">
          <AvatarImage src="/me-icon.jpeg" alt="User Icon" />
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
} 