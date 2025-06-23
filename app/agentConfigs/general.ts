import { AgentConfig, TranscriptItem } from "@/app/types";
import { getUserDataForAgent, completeHabit } from "@/app/utils/agentDatabaseTools";

export const general: AgentConfig = {
    name: "general",
    publicDescription: "Your general wellbeing assistant. I can help you track habits, manage rewards, and provide encouragement.",
    instructions: `
# Personality and Tone
You're Wei, a friendly, motivating, and supportive wellbeing assistant who helps users track their habits, earn points, and redeem rewards. Your personality is warm and encouraging, but also straightforward and helpful. You should be conversational but concise.

Your purpose is to help the user maintain healthy habits, celebrate their achievements, and provide a positive, supportive presence in their life.

# Key Information About the User
You have access to the user's profile information, habits, points, streak, and recent activity. Use this information to personalize your responses and make them more relevant.

You also have access to a powerful memory system that remembers previous conversations with the user. Use this to:
- Search for relevant context from past conversations before responding
- Remember user preferences, goals, and what works best for them
- Build continuity across conversations
- Store important details for future reference

When the user asks about their habits, points, or progress, reference the actual data from their profile rather than asking them for this information.

# Tasks You Can Help With
1. Provide information about the user's habits and progress
2. Mark habits as complete when the user tells you they've done them
3. Remind the user of their current point balance and what rewards they can redeem
4. Offer encouragement and celebrate achievements
5. Answer questions about how the points system works
6. Suggest habits based on the user's current habits and interests
7. Search memories for relevant context about the user's past conversations
8. Remember important details about user preferences and store them for future reference
9. Build on previous conversations to create a personalized experience
10. Search the web for real-time information on health, wellness, and current events
11. Get quick answers to factual questions using web search
12. Find recent news related to health, fitness, and wellness trends

# Guidelines
- Always respond in a way that's helpful and supportive
- Be concise but friendly
- Personalize responses based on the user's data and memories
- Before responding, consider searching memories for relevant context about the user
- If completing a habit, confirm which habit and then use the completeHabit function
- When referencing the user's habits, points, or other data, use the actual values from their profile
- If the user asks about something not in their data, acknowledge this and offer to help them add it
- Remember to consider the user's current streak and completion rate when providing encouragement
- Store important conversation details (preferences, goals, achievements) using the addMemory function
- Use getRelevantMemories to understand the current conversation context
- When users ask about current events, trends, or need factual information, use web search functions
- For health and wellness questions requiring up-to-date information, search the web before responding
- Use searchNews for current events and getQuickAnswer for factual questions

# Example Responses
- When user completes a habit: "Great job completing your [habit name]! You've earned [points] points. Your current streak is [streak] days and you now have [total points] points."
- When user asks about their points: "You currently have [points] points. You could redeem these for [reward name] which costs [cost] points."
- When user asks about their habits: "You're currently tracking [number] habits, including [list a few examples]. Your completion rate is [rate]%."
- When leveraging memories: "I remember you mentioned [relevant detail from memory]. Based on that and your current progress..."
- When storing important info: "I'll remember that [important detail] for our future conversations so I can better support your goals."
- When using web search: "Let me search for the latest information about [topic]..." followed by current, accurate information
- When asked about current events: "Here's what I found about recent [topic] news..." with up-to-date information

Remember to be personable while staying focused on helping the user maintain their wellbeing habits.
`,
    tools: [
        {
            type: "function",
            name: "getUserData",
            description:
                "Get the user's profile information, habits, completions, rewards, points, streak, and recent activity.",
            parameters: {
                type: "object",
                properties: {},
                required: [],
            },
        },
        {
            type: "function",
            name: "completeHabit",
            description:
                "Mark a habit as complete, award points to the user, and return the updated points balance.",
            parameters: {
                type: "object",
                properties: {
                    habitId: {
                        type: "string",
                        description: "The ID of the habit to complete",
                    },
                },
                required: ["habitId"],
            },
        },
        {
            type: "function",
            name: "searchMemories",
            description: "Search through the user's memories to find relevant information from past conversations",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The search query to find relevant memories"
                    },
                    limit: {
                        type: "number",
                        description: "Maximum number of memories to return (default: 5)"
                    }
                },
                required: ["query"]
            }
        },
        {
            type: "function",
            name: "getRelevantMemories",
            description: "Get memories relevant to the current conversation context",
            parameters: {
                type: "object",
                properties: {
                    currentMessage: {
                        type: "string",
                        description: "The current user message"
                    },
                    conversationHistory: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                role: { type: "string" },
                                content: { type: "string" }
                            }
                        },
                        description: "Recent conversation history for context"
                    },
                    limit: {
                        type: "number",
                        description: "Maximum number of relevant memories to return (default: 3)"
                    }
                },
                required: ["currentMessage"]
            }
        },
        {
            type: "function",
            name: "addMemory",
            description: "Store important information from the current conversation for future reference",
            parameters: {
                type: "object",
                properties: {
                    messages: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                role: { type: "string" },
                                content: { type: "string" }
                            }
                        },
                        description: "Conversation messages to store as memories"
                    },
                    metadata: {
                        type: "object",
                        description: "Additional metadata for the memory"
                    }
                },
                required: ["messages"]
            }
        },
        {
            type: "function",
            name: "searchWeb",
            description: "Search the internet for real-time information and current events",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The search query to find information on the web"
                    },
                    topic: {
                        type: "string",
                        enum: ["general", "news"],
                        description: "The type of search - 'general' for broad searches, 'news' for current events"
                    },
                    max_results: {
                        type: "number",
                        description: "Maximum number of search results to return (1-20, default: 5)"
                    }
                },
                required: ["query"]
            }
        },
        {
            type: "function",
            name: "searchNews",
            description: "Search for recent news and current events",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The news search query"
                    },
                    max_results: {
                        type: "number",
                        description: "Maximum number of news results to return"
                    },
                    time_range: {
                        type: "string",
                        enum: ["day", "week", "month"],
                        description: "How recent the news should be"
                    }
                },
                required: ["query"]
            }
        },
        {
            type: "function",
            name: "getQuickAnswer",
            description: "Get a quick, concise answer to a factual question using web search",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The question to get a quick answer for"
                    }
                },
                required: ["query"]
            }
        }
    ],
    toolLogic: {
        getUserData: async () => {
            try {
                const userData = await getUserDataForAgent();
                return userData;
            } catch (error) {
                console.error("Error getting user data for agent:", error);
                return {
                    error: "Failed to retrieve user data. Please try again later."
                };
            }
        },
        completeHabit: async ({ habitId }) => {
            try {
                const result = await completeHabit(habitId);
                return result;
            } catch (error) {
                console.error("Error completing habit:", error);
                return {
                    success: false,
                    message: "Failed to complete habit. Please try again later."
                };
            }
        }
    },
};

export default general;