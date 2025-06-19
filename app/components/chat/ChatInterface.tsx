"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useChat } from "@/app/contexts/ChatContext";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatMessage from "./ChatMessage";
import ChatHistory from "./ChatHistory";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ChatInput } from "../chat-input/chat-input";
import { ArrowLeft, ListMagnifyingGlass, PencilSimpleLine } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
interface ChatInterfaceProps {
}

export default function ChatInterface({ }: ChatInterfaceProps) {
  const { messages, isTyping, sendMessage, clearMessages, loadConversation, currentConversationId } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;
    
    setIsSending(true);
    setInputValue("");
    
    try {
      await sendMessage(inputValue.trim());
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleLoadConversation = (conversation: any) => {
    // Load the conversation messages to the chat
    if (conversation && conversation.messages) {
      // Exclude the welcome message (first message) from the conversation
      const messagesToLoad = conversation.messages.slice(1);
      
      // Load messages into the chat
      loadConversation(messagesToLoad);
      
      // Close drawer
      setIsDrawerOpen(false);
    }
  };

  return (
    <Card className={`flex gap-4 bg-transparent border-none shadow-none flex-col p-2 h-[100dvh]`}>
      <CardHeader className="pb-0 pt-0 px-0 border-b border-border [.border-b]:pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              title="Back to dashboard"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <Avatar className="h-8 w-8 bg-gradient-to-br from-pink-500 to-rose-500">
              <AvatarImage src="/wei-icon.png" alt="Wei Icon" />
              <AvatarFallback>WEI</AvatarFallback>
            </Avatar>
            <span>Chat with Wei</span>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title="Chat History"
                >
                  <ListMagnifyingGlass className="size-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                  <DrawerHeader className="text-center">
                    <DrawerTitle>Conversation History</DrawerTitle>
                  </DrawerHeader>
                  
                  <ChatHistory onSelectConversation={handleLoadConversation} />

                </div>
              </DrawerContent>
            </Drawer>
            
            <Button variant="ghost" size="icon" onClick={clearMessages} title="Reset chat">
              <PencilSimpleLine className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1 px-0 overflow-y-auto" ref={scrollAreaRef}>
        <div className="space-y-4 py-4">
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
            />
          ))}
          
          {isTyping && (
            <div className="flex items-center gap-2 animate-pulse">
              <Avatar className="h-8 w-8 bg-gradient-to-br from-pink-500 to-rose-500">
                <AvatarImage src="/wei-icon.png" alt="Wei Icon" />
                <AvatarFallback>WEI</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                <TextShimmer>
                  Wei is typing...
                </TextShimmer>
              </span>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <CardFooter className="pt-0 px-0 w-full">
        <ChatInput
          value={inputValue}
          onValueChange={setInputValue}
          onSend={handleSendMessage}
          isSubmitting={isSending}
          files={[]}
          onFileUpload={() => {}}
          onFileRemove={() => {}}
          stop={() => {}}
          status={isSending ? "submitted" : "ready"}
          connected={true}
          partnerDisconnected={false}
        />
      </CardFooter>
    </Card>
  );
} 