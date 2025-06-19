"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useDatabase } from './DatabaseContext';
import { useUserCache } from './UserCacheContext';

interface Message {
  id: string;
  sender: 'user' | 'wei';
  content: string;
  timestamp: Date;
}

// Define the OpenAI message format
interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatContextType {
  messages: Message[];
  isTyping: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  getWeiResponse: (content: string, agentName?: string) => Promise<void>;
  loadConversation: (conversationMessages: Message[], conversationId?: string) => void;
  currentConversationId: string | null;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Helper function to convert our Message[] format to OpenAI's expected format
const formatMessagesForAPI = (messages: Array<Message | { role: string; content: string }>): OpenAIMessage[] => {
  return messages.map(msg => {
    if ('sender' in msg) {
      // Convert our Message format to OpenAI format
      return {
        role: msg.sender === 'wei' ? 'assistant' : 'user',
        content: msg.content
      };
    } else {
      // Already in the expected format
      return msg as OpenAIMessage;
    }
  });
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { saveConversation, getConversations } = useDatabase();
  const { cache, refreshCache } = useUserCache();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [pendingUserMessage, setPendingUserMessage] = useState<Message | null>(null);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: `msg_${Date.now()}`,
      sender: 'wei',
      content: "Hi there! \nI'm **Wei**, your personal habit assistant. _How can I help you today?_",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const saveCurrentConversation = useCallback(async () => {
    if (messages.length <= 1) return; // Don't save if only welcome message exists
    
    try {
      if (currentConversationId) {
        // Update existing conversation
        await saveConversation(messages, currentConversationId);
      } else {
        // Create new conversation
        const newId = await saveConversation(messages);
        setCurrentConversationId(newId);
      }
    } catch (err) {
      console.error('Error saving conversation:', err);
    }
  }, [messages, currentConversationId, saveConversation]);

  // Save conversation whenever messages change (but after the initial welcome message)
  useEffect(() => {
    if (messages.length > 1) {
      saveCurrentConversation();
    }
  }, [messages.length, saveCurrentConversation]);

  const getWeiResponse = useCallback(async (content: string, agentName?: string) => {
    setIsTyping(true);
    setError(null);
    
    try {
      // Refresh the cache to ensure we have the latest data
      await refreshCache();

      // Get the current messages from state
      const currentMessages = [...messages];
      
      // Format messages for the API
      const formattedMessages = formatMessagesForAPI(currentMessages);

      // Get the agent config if specified
      let functions;
      if (agentName) {
        try {
          const agentModule = await import(`../agentConfigs/wellbeing/${agentName}`);
          functions = agentModule.default?.functions;
        } catch (err) {
          console.error(`Failed to load agent config: ${agentName}`, err);
        }
      }

      // Create a minimal user context system message if there isn't one already
      let hasSystemMessage = false;
      const updatedMessages = [...formattedMessages];
      
      for (const message of updatedMessages) {
        if (message.role === 'system') {
          hasSystemMessage = true;
          break;
        }
      }
      
      // Add minimal context if no system message exists
      if (!hasSystemMessage && cache) {
        // Create a more descriptive system message with basic user info
        const minimalContext: OpenAIMessage = {
          role: 'system',
          content: `You are Wei, a helpful habit-building assistant. 
The user's name is ${cache.profile?.name || 'User'}.
They currently have ${cache.points || 0} points and a streak of ${cache.streak || 0} days.
They have ${cache.habits?.length || 0} active habits.
Use getUserProfile, getUserStats, getUserHabits and other user data functions to get more details when needed.`
        };
        updatedMessages.unshift(minimalContext);
      }

      // Make the API call - include userCache for function calling
      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: updatedMessages,
          functions,
          userCache: cache // Include userCache for function calls, but keep it minimal in messages
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const newMessage = data.choices[0].message;

      // Create and add the Wei's response message
      const weiResponseMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sender: 'wei',
        content: newMessage.content || '',
        timestamp: new Date()
      };
      
      // Add Wei's response to messages
      setMessages(prev => [...prev, weiResponseMessage]);
    } catch (err) {
      console.error('Error getting response:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsTyping(false);
    }
  }, [messages, refreshCache, cache]);

  const sendMessage = async (content: string) => {
    // Create the user message
    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender: 'user',
      content,
      timestamp: new Date()
    };
    
    // Add user message to messages state directly
    setMessages(prev => [...prev, userMessage]);
    
    // Wait for the state to update before getting Wei's response
    setTimeout(async () => {
      await getWeiResponse(content);
    }, 100);
  };

  const clearMessages = () => {
    // Keep only the welcome message
    const welcomeMessage = messages[0];
    setMessages([welcomeMessage]);
    // Reset the current conversation ID to start a new conversation
    setCurrentConversationId(null);
    // Clear any pending message
    setPendingUserMessage(null);
  };

  const loadConversation = (conversationMessages: Message[], conversationId?: string) => {
    // If there are messages in the conversation, replace current messages
    if (conversationMessages && conversationMessages.length > 0) {
      // Get the first welcome message from current chat
      const welcomeMessage = messages[0];
      
      // Set the welcome message followed by the conversation messages
      setMessages([welcomeMessage, ...conversationMessages]);
      
      // Set the conversation ID if provided
      if (conversationId) {
        setCurrentConversationId(conversationId);
      }
    }
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      isTyping, 
      error, 
      sendMessage, 
      clearMessages,
      getWeiResponse,
      loadConversation,
      currentConversationId
    }}>
      {children}
    </ChatContext.Provider>
  );
}; 