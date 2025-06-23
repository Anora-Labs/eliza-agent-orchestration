import { Memory } from 'mem0ai/oss';

// Initialize Mem0 with OpenAI and Supabase configuration
const memoryConfig = {
  version: 'v1.1',
  embedder: {
    provider: 'openai',
    config: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'text-embedding-3-small',
    },
  },
  vectorStore: {
    provider: 'memory',
    config: {
      collectionName: 'memories',
      dimension: 1536,
    },
  },
  llm: {
    provider: 'openai',
    config: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4o-mini',
      temperature: 0.2,
      maxTokens: 1500,
    },
  },
  historyStore: {
    provider: 'supabase',
    config: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE || '',
      tableName: 'memory_history',
    },
  },
};

// Create memory instance
let memoryInstance: Memory | null = null;

const getMemoryInstance = () => {
  if (!memoryInstance) {
    memoryInstance = new Memory(memoryConfig);
  }
  return memoryInstance;
};

export class MemoryService {
  private memory: Memory;

  constructor() {
    this.memory = getMemoryInstance();
  }

  /**
   * Add memories from conversation messages
   */
  async addMemories(
    messages: Array<{ role: string; content: string }>,
    userId: string,
    metadata?: Record<string, any>
  ) {
    try {
      const result = await this.memory.add(messages, {
        userId,
        metadata: {
          timestamp: new Date().toISOString(),
          ...metadata,
        },
      });
      return result;
    } catch (error) {
      console.error('Error adding memories:', error);
      throw error;
    }
  }

  /**
   * Search memories for a user
   */
  async searchMemories(query: string, userId: string, limit: number = 5) {
    try {
      const result = await this.memory.search(query, {
        userId,
        limit,
      });
      return result;
    } catch (error) {
      console.error('Error searching memories:', error);
      throw error;
    }
  }

  /**
   * Get all memories for a user
   */
  async getAllMemories(userId: string) {
    try {
      const result = await this.memory.getAll({ userId });
      return result;
    } catch (error) {
      console.error('Error getting all memories:', error);
      throw error;
    }
  }

  /**
   * Get a specific memory by ID
   */
  async getMemory(memoryId: string) {
    try {
      const result = await this.memory.get(memoryId);
      return result;
    } catch (error) {
      console.error('Error getting memory:', error);
      throw error;
    }
  }

  /**
   * Update a memory
   */
  async updateMemory(memoryId: string, newContent: string) {
    try {
      const result = await this.memory.update(memoryId, newContent);
      return result;
    } catch (error) {
      console.error('Error updating memory:', error);
      throw error;
    }
  }

  /**
   * Delete a specific memory
   */
  async deleteMemory(memoryId: string) {
    try {
      await this.memory.delete(memoryId);
      return { success: true, message: 'Memory deleted successfully' };
    } catch (error) {
      console.error('Error deleting memory:', error);
      throw error;
    }
  }

  /**
   * Delete all memories for a user
   */
  async deleteAllMemories(userId: string) {
    try {
      await this.memory.deleteAll({ userId });
      return { success: true, message: 'All memories deleted successfully' };
    } catch (error) {
      console.error('Error deleting all memories:', error);
      throw error;
    }
  }

  /**
   * Get memory history
   */
  async getMemoryHistory(memoryId: string) {
    try {
      const result = await this.memory.history(memoryId);
      return result;
    } catch (error) {
      console.error('Error getting memory history:', error);
      throw error;
    }
  }

  /**
   * Reset all memories (use with caution)
   */
  async resetAllMemories() {
    try {
      await this.memory.reset();
      return { success: true, message: 'All memories reset successfully' };
    } catch (error) {
      console.error('Error resetting memories:', error);
      throw error;
    }
  }

  /**
   * Get relevant memories for current conversation context
   */
  async getRelevantMemories(
    currentMessage: string,
    userId: string,
    conversationHistory: Array<{ role: string; content: string }> = [],
    limit: number = 3
  ) {
    try {
      // Search for memories related to the current message
      const relevantMemoriesResult = await this.searchMemories(currentMessage, userId, limit);
      
      // If we have conversation history, also search for memories related to recent topics
      if (conversationHistory.length > 0) {
        const recentMessages = conversationHistory.slice(-3); // Last 3 messages
        const contextQuery = recentMessages
          .map(msg => msg.content)
          .join(' ');
        
        const contextMemoriesResult = await this.searchMemories(contextQuery, userId, limit);
        
        // Combine and deduplicate memories
        const allMemories = [...relevantMemoriesResult.results, ...contextMemoriesResult.results];
        const uniqueMemories = allMemories.filter(
          (memory, index, self) => 
            index === self.findIndex(m => m.id === memory.id)
        );
        
        return uniqueMemories.slice(0, limit);
      }
      
      return relevantMemoriesResult.results;
    } catch (error) {
      console.error('Error getting relevant memories:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const memoryService = new MemoryService(); 