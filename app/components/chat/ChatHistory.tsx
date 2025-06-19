"use client";

import { useState, useEffect, useRef } from "react";
import { useDatabase } from "@/app/contexts/DatabaseContext";
import { formatDistanceToNow } from "date-fns";
import { CaretRight, ClockCounterClockwise, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { useChat } from "@/app/contexts/ChatContext";

interface ChatHistoryProps {
  onSelectConversation: (conversation: any) => void;
}

export default function ChatHistory({ onSelectConversation }: ChatHistoryProps) {
  const { getConversations } = useDatabase();
  const { currentConversationId } = useChat();
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadConversationHistory = async () => {
    setIsLoading(true);
    try {
      const conversations = await getConversations();
      
      // Sort conversations by date, newest first
      // Use updatedAt if available, otherwise fallback to createdAt
      const sortedConversations = conversations.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(a.createdAt);
        const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      setConversationHistory(sortedConversations);
    } catch (error) {
      console.error("Failed to load conversation history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load conversation history when component mounts or when currentConversationId changes
  useEffect(() => {
    loadConversationHistory();
  }, [currentConversationId]);

  // Get a summary of the conversation to display in the list
  const getConversationSummary = (conversation: any) => {
    // Find the first user message, if it exists
    const firstUserMessage = conversation.messages.find(
      (msg: any) => msg.sender === 'user' || msg.role === 'user'
    );
    
    if (firstUserMessage) {
      const content = firstUserMessage.content || '';
      return content.length > 40 ? `${content.substring(0, 40)}...` : content;
    }
    
    // Fallback to first message if no user message is found
    if (conversation.messages[0]) {
      const content = conversation.messages[0].content || '';
      return content.length > 40 ? `${content.substring(0, 40)}...` : content;
    }
    
    return "Empty conversation";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search recent chats..." 
          className="pl-10 placeholder:text-sm" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex-1 px-0 overflow-y-auto" ref={scrollAreaRef}>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : conversationHistory.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>No conversation history found</p>
          </div>
        ) : (
          <div className="space-y-2 my-4 h-[60vh] overflow-y-auto">
            {conversationHistory
              .filter(conversation => {
                // Check if any message in the conversation includes the search query
                return conversation.messages.some((msg: any) => 
                  (msg.content || '').toLowerCase().includes(searchQuery.toLowerCase())
                );
              })
              .map((conversation) => (
                <div
                  key={conversation.id}
                  className={`flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer ${
                    currentConversationId === conversation.id ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <ClockCounterClockwise className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {getConversationSummary(conversation)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(
                          new Date(conversation.updatedAt || conversation.createdAt), 
                          { addSuffix: true }
                        )}
                      </p>
                    </div>
                  </div>
                  <CaretRight className="size-4 text-muted-foreground" />
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
