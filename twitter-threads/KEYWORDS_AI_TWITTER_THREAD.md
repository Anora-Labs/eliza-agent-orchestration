# Twitter Thread: Integrating Keywords AI into AI Agentic Apps 🧵

## Thread: Give Your AI Agents Enterprise-Grade Observability with Keywords AI 📊🤖

### Tweet 1/15
🚀 Building AI agents but struggling to monitor their performance? Here's how I integrated @KeywordsAI into my AI agent system to get enterprise-grade observability, analytics, and cost tracking.

The result? Complete visibility into every AI interaction! 🧵👇

### Tweet 2/15
🤔 The Problem: AI agents are black boxes. You can't see what prompts they're using, how much they cost, which models perform best, or why they sometimes fail.

Solution: Keywords AI = Complete LLM observability with logs, metrics, and analytics! 📈

### Tweet 3/15
📊 Keywords AI gives you everything you need to monitor AI agents:
• Complete request/response logging
• Real-time cost tracking
• Performance metrics
• Error debugging
• User analytics
• Model comparison

All in one beautiful dashboard! ✨

### Tweet 4/15
🛠️ Integration is incredibly simple. Just update your OpenAI client to use Keywords AI proxy:

```typescript
const openai = new OpenAI({
  baseURL: "https://api.keywordsai.co/api",
  apiKey: process.env.KEYWORDS_AI_API_KEY
});
```

That's it! All requests are now automatically logged! 🎯

### Tweet 5/15
💡 But here's where it gets powerful - Keywords AI service class for advanced tracking:

```typescript
export class KeywordsAIService {
  getCompletionParams(userId, conversationId, metadata) {
    return {
      customer_identifier: userId || 'anonymous_user',
      thread_id: conversationId || `conversation_${Date.now()}`,
      customer_user_id: userId,
      ...metadata
    };
  }
}
```

### Tweet 6/15
🎯 Enhanced completion requests with user tracking:

```typescript
const keywordsAIParams = keywordsAIService.getCompletionParams(
  userId,
  userCache?.conversationId,
  { source: 'wei-ai-assistant' }
);

const completion = await openai.chat.completions.create({
  model,
  messages,
  ...keywordsAIParams  // Magic happens here!
});
```

### Tweet 7/15
📈 The real power comes from event tracking. Here's how I track different AI agent operations:

```typescript
// Track memory operations
await keywordsAIService.trackMemoryOperation(userId, 'search', metadata);

// Track search operations  
await keywordsAIService.trackSearchOperation(userId, 'web', query, resultsCount);

// Track agent interactions
await keywordsAIService.trackAgentInteraction(userId, agentName, 'function_call');
```

### Tweet 8/15
🔍 Real-time monitoring in action:

1. User asks AI agent a question
2. Agent calls multiple functions (memory, search, tools)
3. Each operation is automatically logged
4. Keywords AI dashboard shows complete conversation flow
5. You can debug issues in real-time!

Perfect for production! 🚀

### Tweet 9/15
⚡ Advanced tracking features I'm using:

```typescript
async trackHabitCompletion(userId, habitId, habitName, pointsEarned) {
  await this.trackEvent('habit_completed', userId, {
    habit_id: habitId,
    habit_name: habitName,
    points_earned: pointsEarned,
    category: 'wellness'
  });
}
```

Custom events for business-specific analytics! 📊

### Tweet 10/15
🛡️ Error handling and health monitoring:

```typescript
async getHealthStatus() {
  try {
    const response = await fetch(`${this.config.baseURL}/health`, {
      headers: { 'Authorization': `Bearer ${this.config.apiKey}` }
    });
    return response.ok ? 
      { status: 'healthy', message: 'Keywords AI operational' } :
      { status: 'error', message: `API responded with ${response.status}` };
  } catch (error) {
    return { status: 'error', message: `Connection failed: ${error.message}` };
  }
}
```

### Tweet 11/15
📊 What you get in the Keywords AI dashboard:

- **Complete conversation logs** with prompts & responses
- **Cost breakdown** by model, user, and time period
- **Performance metrics** like response time and token usage
- **Error tracking** with full stack traces
- **User analytics** showing engagement patterns

### Tweet 12/15
🎮 Real example from my Wei AI agent:

User: "Help me build a morning routine"
→ Function call: `getUserHabits()`
→ Function call: `searchMemories("morning routine")`
→ Function call: `addMemory()` to store preferences

Every step logged with costs, timing, and success rates! 📈

### Tweet 13/15
🚀 Production benefits I'm seeing:

- ⚡ Identify slow function calls instantly
- 💰 Track exact costs per user/conversation
- 🎯 Optimize prompts based on success rates
- 🛡️ Debug errors with complete context
- 📱 Monitor usage patterns and scaling needs
- 🌍 Compare model performance across regions

### Tweet 14/15
🛠️ The complete integration took maybe 1 hour:

✅ 10 min: Update OpenAI client baseURL
✅ 20 min: Keywords AI service setup
✅ 20 min: Custom event tracking
✅ 10 min: Health monitoring

Most time was on custom analytics, core logging is instant! ⭐

### Tweet 15/15
🎯 Key takeaways:

1. Observability is essential for production AI agents
2. Keywords AI makes LLM monitoring effortless
3. User tracking enables powerful analytics
4. Custom events provide business insights
5. Essential for any serious AI application

Start monitoring your agents today! 🚀

---

## Technical Implementation Deep Dive

### Complete Keywords AI Service Implementation

```typescript
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

export class KeywordsAIService {
  private config: KeywordsAIConfig;

  constructor() {
    this.config = {
      apiKey: process.env.KEYWORDS_AI_API_KEY || '',
      baseURL: 'https://api.keywordsai.co/api',
    };
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
   * Get user analytics and usage metrics
   */
  async getUserMetrics(userId: string): Promise<KeywordsAIMetrics | null> {
    if (!this.config.apiKey) return null;

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
}
```

### OpenAI Client Integration

```typescript
import OpenAI from "openai";
import { keywordsAIService } from "@/lib/keywords-ai";

// Initialize OpenAI client with Keywords AI proxy
const openai = new OpenAI({
  baseURL: "https://api.keywordsai.co/api",
  apiKey: process.env.KEYWORDS_AI_API_KEY || process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { model, messages, functions, userCache } = await req.json();
    
    // Get user ID for tracking
    const userId = await getCurrentUserId();
    
    // Get Keywords AI parameters for enhanced logging
    const keywordsAIParams = keywordsAIService.getCompletionParams(
      userId,
      userCache?.conversationId,
      { source: 'wei-ai-assistant' }
    );
    
    // Make the API call with enhanced logging
    const completion = await openai.chat.completions.create({
      model,
      messages,
      functions,
      ...keywordsAIParams,  // This enables automatic logging
    });

    return NextResponse.json(completion);
  } catch (error) {
    console.error("Error in /chat/completions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Advanced Event Tracking

```typescript
// Track habit completion events
await keywordsAIService.trackHabitCompletion(
  userId,
  habitId,
  habitName,
  pointsEarned
);

// Track memory operations
await keywordsAIService.trackMemoryOperation(
  userId,
  'search',
  { query: 'user preferences', results_count: 5 }
);

// Track search operations
await keywordsAIService.trackSearchOperation(
  userId,
  'web',
  query,
  searchResponse.results.length
);

// Track agent interactions
await keywordsAIService.trackAgentInteraction(
  userId,
  'habit-coach',
  'function_call',
  { function_name: 'getUserHabits', success: true }
);
```

### Function Call Tracking Integration

```typescript
// Enhanced function call handling with tracking
async function handleDatabaseFunction(name: string, args: any, userCache: any) {
  const userId = await getCurrentUserId();
  
  switch (name) {
    case "searchMemories":
      try {
        const memories = await memoryService.searchMemories(
          args.query, userId, args.limit || 5
        );
        
        // Track the memory operation
        if (userId) {
          await keywordsAIService.trackMemoryOperation(
            userId,
            'search',
            { 
              query: args.query,
              results_count: memories.length,
              limit: args.limit 
            }
          );
        }
        
        return JSON.stringify({ memories, count: memories.length });
      } catch (error) {
        // Track the error
        if (userId) {
          await keywordsAIService.trackEvent('memory_error', userId, {
            operation: 'search',
            error: error.message
          });
        }
        throw error;
      }

    case "searchWeb":
      try {
        const searchResponse = await tavilyService.search({
          query: args.query,
          topic: args.topic || 'general',
          max_results: args.max_results || 5,
        });
        
        // Track search operation
        if (userId) {
          await keywordsAIService.trackSearchOperation(
            userId,
            'web',
            args.query,
            searchResponse.results.length
          );
        }
        
        return JSON.stringify({
          success: true,
          ...searchResponse
        });
      } catch (error) {
        // Track search errors
        if (userId) {
          await keywordsAIService.trackEvent('search_error', userId, {
            search_type: 'web',
            query: args.query,
            error: error.message
          });
        }
        throw error;
      }
  }
}
```

## Production Benefits & Use Cases

### 1. Cost Optimization
```typescript
// Get cost breakdown by user
const userMetrics = await keywordsAIService.getUserMetrics(userId);
console.log(`User ${userId} has spent $${userMetrics.total_cost} this month`);

// Track high-cost operations
await keywordsAIService.trackEvent('high_cost_operation', userId, {
  operation: 'complex_search',
  estimated_cost: 0.15,
  tokens_used: 2500
});
```

### 2. Performance Monitoring
```typescript
// Monitor response times
const startTime = Date.now();
const completion = await openai.chat.completions.create(options);
const responseTime = Date.now() - startTime;

await keywordsAIService.trackEvent('performance_metric', userId, {
  operation: 'chat_completion',
  response_time: responseTime,
  model: options.model,
  tokens: completion.usage?.total_tokens
});
```

### 3. Error Tracking & Debugging
```typescript
try {
  await processAgentRequest(request);
} catch (error) {
  await keywordsAIService.trackEvent('agent_error', userId, {
    error_type: error.constructor.name,
    error_message: error.message,
    request_context: request.context,
    stack_trace: error.stack?.slice(0, 1000) // Truncate for storage
  });
  throw error;
}
```

### 4. User Behavior Analytics
```typescript
// Track user engagement patterns
await keywordsAIService.trackEvent('user_session', userId, {
  session_duration: sessionDuration,
  messages_sent: messageCount,
  functions_called: functionCallCount,
  agent_types_used: ['habit-coach', 'general-assistant']
});
```

## Dashboard Features from [Keywords AI](https://docs.keywordsai.co/features/monitoring/logging/overview)

### LLM Logs
- Complete request/response history
- Prompt and completion visibility
- Token usage tracking
- Response time metrics
- Cost calculation per request

### Advanced Filtering
- Filter by user, model, status, time range
- Search through prompts and responses
- Custom metadata filtering
- Error-specific filtering

### Full-Text Search
- Search across all logged conversations
- Find specific prompts or responses
- Debug issues quickly
- Analyze usage patterns

### Analytics Dashboard
- User engagement metrics
- Cost trends over time
- Model performance comparison
- Error rate monitoring
- Custom event analytics

---

*This Twitter thread demonstrates a production-ready Keywords AI integration in an AI agent system. The code examples are from the actual Wei AI Agent project, showing real-world implementation patterns for enterprise-grade AI observability.* 