interface KeywordsAIConfig {
  apiKey: string;
  baseURL: string;
}

interface KeywordsAILogData {
  customer_identifier?: string;
  thread_id?: string;
  customer_user_id?: string;
  model: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp?: string;
  }>;
  response?: string;
  tokens_used?: number;
  response_time?: number;
  cost?: number;
  metadata?: Record<string, any>;
}

interface KeywordsAIMetrics {
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  average_response_time: number;
  error_rate: number;
  top_models: Array<{ model: string; usage_count: number }>;
  daily_usage: Array<{ date: string; requests: number; tokens: number }>;
}

export class KeywordsAIService {
  private config: KeywordsAIConfig;

  constructor() {
    this.config = {
      apiKey: process.env.KEYWORDS_AI_API_KEY || '',
      baseURL: 'https://api.keywordsai.co/api',
    };

    if (!this.config.apiKey) {
      console.warn('KEYWORDS_AI_API_KEY not found in environment variables');
    }
  }

  /**
   * Get enhanced completion parameters for Keywords AI
   */
  getCompletionParams(
    userId?: string | null,
    conversationId?: string,
    metadata?: Record<string, any>
  ) {
    return {
      customer_identifier: userId || 'anonymous_user',
      thread_id: conversationId || `conversation_${Date.now()}`,
      customer_user_id: userId,
      ...metadata,
    };
  }

  /**
   * Log conversation data to Keywords AI for analytics
   */
  async logConversation(data: KeywordsAILogData): Promise<void> {
    if (!this.config.apiKey) {
      console.warn('Keywords AI not configured, skipping logging');
      return;
    }

    try {
      await fetch(`${this.config.baseURL}/logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          source: 'wei-ai-assistant',
        }),
      });
    } catch (error) {
      console.error('Failed to log conversation to Keywords AI:', error);
    }
  }

  /**
   * Get user analytics and usage metrics
   */
  async getUserMetrics(userId: string): Promise<KeywordsAIMetrics | null> {
    if (!this.config.apiKey) {
      console.warn('Keywords AI not configured');
      return null;
    }

    try {
      const response = await fetch(
        `${this.config.baseURL}/analytics/users/${userId}/metrics`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user metrics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user metrics:', error);
      return null;
    }
  }

  /**
   * Get overall application metrics
   */
  async getApplicationMetrics(
    timeRange: 'day' | 'week' | 'month' = 'week'
  ): Promise<KeywordsAIMetrics | null> {
    if (!this.config.apiKey) {
      console.warn('Keywords AI not configured');
      return null;
    }

    try {
      const response = await fetch(
        `${this.config.baseURL}/analytics/metrics?range=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch app metrics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch application metrics:', error);
      return null;
    }
  }

  /**
   * Track specific events for analysis
   */
  async trackEvent(
    event: string,
    userId?: string,
    properties?: Record<string, any>
  ): Promise<void> {
    if (!this.config.apiKey) return;

    try {
      await fetch(`${this.config.baseURL}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          user_id: userId,
          properties: {
            ...properties,
            timestamp: new Date().toISOString(),
            source: 'wei-ai-assistant',
          },
        }),
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Track habit completion events
   */
  async trackHabitCompletion(
    userId: string,
    habitId: string,
    habitName: string,
    pointsEarned: number
  ): Promise<void> {
    await this.trackEvent('habit_completed', userId, {
      habit_id: habitId,
      habit_name: habitName,
      points_earned: pointsEarned,
      category: 'wellness',
    });
  }

  /**
   * Track memory operations
   */
  async trackMemoryOperation(
    userId: string,
    operation: 'add' | 'search' | 'retrieve',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent('memory_operation', userId, {
      operation,
      ...metadata,
      category: 'memory',
    });
  }

  /**
   * Track search operations
   */
  async trackSearchOperation(
    userId: string,
    searchType: 'web' | 'news' | 'quick_answer',
    query: string,
    resultsCount?: number
  ): Promise<void> {
    await this.trackEvent('search_operation', userId, {
      search_type: searchType,
      query_length: query.length,
      results_count: resultsCount,
      category: 'search',
    });
  }

  /**
   * Track agent interactions
   */
  async trackAgentInteraction(
    userId: string,
    agentName: string,
    interactionType: 'chat' | 'function_call' | 'tool_use',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent('agent_interaction', userId, {
      agent_name: agentName,
      interaction_type: interactionType,
      ...metadata,
      category: 'agents',
    });
  }

  /**
   * Get conversation insights
   */
  async getConversationInsights(
    userId: string,
    threadId: string
  ): Promise<any> {
    if (!this.config.apiKey) return null;

    try {
      const response = await fetch(
        `${this.config.baseURL}/analytics/conversations/${threadId}/insights`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch insights: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch conversation insights:', error);
      return null;
    }
  }

  /**
   * Check if Keywords AI is properly configured
   */
  isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  /**
   * Get health status of Keywords AI integration
   */
  async getHealthStatus(): Promise<{ status: 'healthy' | 'error'; message: string }> {
    if (!this.config.apiKey) {
      return { status: 'error', message: 'API key not configured' };
    }

    try {
      const response = await fetch(`${this.config.baseURL}/health`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (response.ok) {
        return { status: 'healthy', message: 'Keywords AI is operational' };
      } else {
        return { status: 'error', message: `API responded with ${response.status}` };
      }
    } catch (error) {
      return { 
        status: 'error', 
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

// Export a singleton instance
export const keywordsAIService = new KeywordsAIService(); 