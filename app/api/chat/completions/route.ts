import { NextResponse } from "next/server";
import OpenAI from "openai";
import { memoryService } from "@/lib/memory";
import { tavilyService } from "@/lib/tavily";
import { createClient } from "@/lib/supabase/server";

const openai = new OpenAI();

// Define default functions that all agents can access
const defaultFunctions = [
  {
    name: "getUserProfile",
    description: "Get the user's profile information",
    parameters: {
      type: "object",
      properties: {
        fields: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Optional array of specific profile fields to retrieve"
        }
      },
      required: []
    }
  },
  {
    name: "getUserHabits",
    description: "Get the list of habits the user has created",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "getHabitCompletions",
    description: "Get the list of habit completions for the past X days",
    parameters: {
      type: "object",
      properties: {
        daysAgo: {
          type: "number",
          description: "Get completions from this many days ago (default 30)"
        }
      },
      required: []
    }
  },
  {
    name: "completeHabit",
    description: "Mark a habit as complete and award points to the user",
    parameters: {
      type: "object",
      properties: {
        habitId: {
          type: "string",
          description: "The ID of the habit to mark as complete"
        }
      },
      required: ["habitId"]
    }
  },
  {
    name: "getUserStats",
    description: "Get the user's current points balance and streak information",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "getUserRewards",
    description: "Get the list of rewards available to the user",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "getRewardRedemptions",
    description: "Get the user's past reward redemptions",
    parameters: {
      type: "object",
      properties: {
        daysAgo: {
          type: "number",
          description: "Get redemptions from this many days ago (default 30)"
        }
      },
      required: []
    }
  },
  {
    name: "redeemReward",
    description: "Redeem a reward for the user, deducting points from their balance",
    parameters: {
      type: "object",
      properties: {
        rewardId: {
          type: "string",
          description: "The ID of the reward to redeem"
        }
      },
      required: ["rewardId"]
    }
  },
  {
    name: "calculateBonusPoints",
    description: "Calculate bonus points based on streak, consistency, and habit difficulty",
    parameters: {
      type: "object",
      properties: {
        habitId: {
          type: "string",
          description: "The ID of the habit to calculate bonuses for"
        },
        basePoints: {
          type: "number",
          description: "The base points awarded for this habit"
        }
      },
      required: ["habitId", "basePoints"]
    }
  },
  {
    name: "searchMemories",
    description: "Search through the user's memories to find relevant information",
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
    name: "getAllMemories",
    description: "Get all memories for the current user",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of memories to return"
        }
      },
      required: []
    }
  },
  {
    name: "addMemory",
    description: "Store new memories from the current conversation",
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
    name: "deleteMemory",
    description: "Delete a specific memory by ID",
    parameters: {
      type: "object",
      properties: {
        memoryId: {
          type: "string",
          description: "The ID of the memory to delete"
        }
      },
      required: ["memoryId"]
    }
  },
  {
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
            description: "The type of search - 'general' for broad searches, 'news' for current events (default: general)"
          },
          max_results: {
            type: "number",
            description: "Maximum number of search results to return (1-20, default: 5)"
          },
          time_range: {
            type: "string",
            enum: ["day", "week", "month", "year"],
            description: "Time range for news searches (only applicable when topic is 'news')"
          },
          include_answer: {
            type: "boolean",
            description: "Whether to include an AI-generated answer summary (default: true)"
          }
        },
        required: ["query"]
      }
    },
    {
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
            description: "Maximum number of news results to return (1-20, default: 5)"
          },
          time_range: {
            type: "string",
            enum: ["day", "week", "month"],
            description: "How recent the news should be (default: week)"
          }
        },
        required: ["query"]
      }
    },
    {
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
  ];

// Helper function to get user ID from session
async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      console.error('Error getting current user:', error);
      return null;
    }
    return user.id;
  } catch (error) {
    console.error('Error in getCurrentUserId:', error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    // Extract request parameters
    const { model, messages, functions, function_call, userCache } = await req.json();

    // Set up the completion options
    const completionOptions: any = {
      model,
      messages,
    };

    // Use client-provided functions or default functions
    if (functions) {
      completionOptions.functions = functions;
    } else {
      completionOptions.functions = defaultFunctions;
    }

    // Handle function_call parameter
    if (function_call) {
      completionOptions.function_call = function_call;
    } else {
      completionOptions.function_call = 'auto';
    }

    // Make the API call
    const completion = await openai.chat.completions.create(completionOptions);

    // Check if the model has generated a function call
    const message = completion.choices[0].message;
    
    if (message.function_call) {
      // Handle the function call using cached data if available
      const functionResponse = await handleFunctionCall(message.function_call, userCache);
      
      // Add the function call and result to the messages for a follow-up
      const newMessages = [
        ...messages,
        {
          role: 'assistant',
          content: null,
          function_call: message.function_call
        },
        {
          role: 'function',
          name: message.function_call.name,
          content: functionResponse
        }
      ];
      
      // Call the model again with the function result
      const followUpCompletion = await openai.chat.completions.create({
        model,
        messages: newMessages,
        functions: completionOptions.functions,
        function_call: 'auto'
      });
      
      return NextResponse.json(followUpCompletion);
    }

    if (message.tool_calls) {
      // Handle tool calls in the OpenAI format
      const toolResponse = await handleToolCalls(message.tool_calls, userCache);
      
      // Add the tool calls and result to messages for follow-up
      const newMessages = [
        ...messages,
        {
          role: 'assistant',
          content: null,
          tool_calls: message.tool_calls
        }
      ];
      
      // Add each tool response
      for (const toolCall of toolResponse) {
        newMessages.push({
          role: 'tool',
          tool_call_id: toolCall.tool_call_id,
          content: toolCall.content
        });
      }
      
      // Call the model again with the tool results
      const followUpCompletion = await openai.chat.completions.create({
        model,
        messages: newMessages,
        tools: completionOptions.functions.map((fn: any) => ({ type: 'function', function: fn })),
        tool_choice: 'auto'
      });
      
      return NextResponse.json(followUpCompletion);
    }

    return NextResponse.json(completion);
  } catch (error: any) {
    console.error("Error in /chat/completions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handle function calls using cached data
async function handleFunctionCall(functionCall: any, userCache: any) {
  const { name, arguments: argsString } = functionCall;
  let args;
  
  try {
    args = JSON.parse(argsString);
  } catch (e) {
    return JSON.stringify({ error: "Invalid function arguments" });
  }

  // If we have userCache, use it for function responses
  if (userCache) {
    return await handleDatabaseFunction(name, args, userCache);
  }

  // Otherwise return a message that the function isn't available without cached data
  return JSON.stringify({
    error: "This function requires user data that is not currently available.",
    message: "Please try refreshing the page to load your latest data."
  });
}

// Handle tool calls using cached data
async function handleToolCalls(toolCalls: any, userCache: any) {
  const responses = [];
  
  for (const toolCall of toolCalls) {
    if (toolCall.type === 'function') {
      const { name, arguments: argsString } = toolCall.function;
      let args;
      
      try {
        args = JSON.parse(argsString);
      } catch (e) {
        responses.push({
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: "Invalid function arguments" })
        });
        continue;
      }
      
      const result = await handleDatabaseFunction(name, args, userCache);
      responses.push({
        tool_call_id: toolCall.id,
        content: result
      });
    }
  }
  
  return responses;
}

// Central handler for all database functions with user cache
async function handleDatabaseFunction(name: string, args: any, userCache: any) {
  switch (name) {
    case "getUserProfile":
      // Return the user profile with optional field filtering
      if (args.fields && Array.isArray(args.fields) && args.fields.length > 0) {
        const filteredProfile: Record<string, any> = {};
        for (const field of args.fields) {
          if (userCache.profile && userCache.profile[field] !== undefined) {
            filteredProfile[field] = userCache.profile[field];
          }
        }
        return JSON.stringify(filteredProfile);
      }
      // Return the complete profile if no fields specified
      return JSON.stringify(userCache.profile || { name: "Unknown User" });

    case "getUserHabits":
      // Filter habits by category if specified
      if (args.category && userCache.habits) {
        const filteredHabits = userCache.habits.filter((habit: any) => habit.category === args.category);
        return JSON.stringify({
          habits: filteredHabits,
          count: filteredHabits.length
        });
      }
      // Return all habits if no category filter
      return JSON.stringify({
        habits: userCache.habits || [],
        count: (userCache.habits || []).length
      });

    case "getHabitCompletions":
      // Get completions from the past X days
      const daysAgo = args.daysAgo || 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      
      // Filter completions by date
      const filteredCompletions = userCache.completions
        ? userCache.completions.filter(
            (completion: any) => new Date(completion.completedAt) >= cutoffDate
          )
        : [];
      
      return JSON.stringify({
        completions: filteredCompletions,
        count: filteredCompletions.length
      });

    case "getUserStats":
      // Return points and streak
      return JSON.stringify({
        points: userCache.points || 0,
        streak: userCache.streak || 0
      });

    case "getUserRewards":
      // Return all rewards
      return JSON.stringify({
        rewards: userCache.rewards || [],
        count: (userCache.rewards || []).length
      });

    case "getRewardRedemptions":
      // Get redemptions from the past X days
      const redemptionDaysAgo = args.daysAgo || 30;
      const redemptionCutoffDate = new Date();
      redemptionCutoffDate.setDate(redemptionCutoffDate.getDate() - redemptionDaysAgo);
      
      // Filter redemptions by date
      const filteredRedemptions = userCache.redemptions
        ? userCache.redemptions.filter(
            (redemption: any) => new Date(redemption.redeemedAt) >= redemptionCutoffDate
          )
        : [];
      
      return JSON.stringify({
        redemptions: filteredRedemptions,
        count: filteredRedemptions.length
      });

    case "getRecentActivity":
      // Get recent activity with optional filtering
      let activities = userCache.recentActivity || [];
      const limit = args.limit || 5;
      
      // Filter by activity type if provided
      if (args.activityType) {
        activities = activities.filter((activity: any) => activity.action === args.activityType);
      }
      
      return JSON.stringify({
        activities: activities.slice(0, limit),
        count: activities.length
      });

    case "completeHabit":
      // This would normally update the database, but in this context
      // we're just returning a success message since we can't modify the DB from here
      return JSON.stringify({
        success: true,
        message: "Habit marked as complete (simulation only, database not updated)"
      });

    case "redeemReward":
      // This would normally update the database, but in this context
      // we're just returning a success message since we can't modify the DB from here
      return JSON.stringify({
        success: true,
        message: "Reward redeemed (simulation only, database not updated)"
      });

    case "calculateBonusPoints":
      // Get the habit from cache
      const habit = userCache.habits
        ? userCache.habits.find((h: any) => h.id === args.habitId)
        : null;
      
      if (!habit) {
        return JSON.stringify({
          error: "Habit not found",
          bonusPoints: 0
        });
      }
      
      // Calculate a simple bonus based on streak
      const streakBonus = Math.min(50, Math.floor(userCache.streak / 2));
      const difficultyBonus = habit.difficulty ? (habit.difficulty * 5) : 0;
      const totalBonus = streakBonus + difficultyBonus;
      
      return JSON.stringify({
        basePoints: args.basePoints,
        streakBonus,
        difficultyBonus, 
        totalBonus,
        totalPoints: args.basePoints + totalBonus
      });

    // Memory functions
    case "searchMemories":
      const userId = await getCurrentUserId();
      if (!userId) {
        return JSON.stringify({
          error: "User not authenticated",
          memories: []
        });
      }
      
      try {
        const memories = await memoryService.searchMemories(
          args.query,
          userId,
          args.limit || 5
        );
        return JSON.stringify({
          memories,
          count: Array.isArray(memories) ? memories.length : 0
        });
      } catch (error) {
        console.error('Error searching memories:', error);
        return JSON.stringify({
          error: "Failed to search memories",
          memories: []
        });
      }

    case "getAllMemories":
      const userIdForAll = await getCurrentUserId();
      if (!userIdForAll) {
        return JSON.stringify({
          error: "User not authenticated",
          memories: []
        });
      }
      
      try {
        const allMemories = await memoryService.getAllMemories(userIdForAll);
        return JSON.stringify({
          memories: allMemories,
          count: Array.isArray(allMemories) ? allMemories.length : 0
        });
      } catch (error) {
        console.error('Error getting all memories:', error);
        return JSON.stringify({
          error: "Failed to get memories",
          memories: []
        });
      }

    case "addMemory":
      const userIdForAdd = await getCurrentUserId();
      if (!userIdForAdd) {
        return JSON.stringify({
          error: "User not authenticated",
          success: false
        });
      }
      
      try {
        const result = await memoryService.addMemories(
          args.messages,
          userIdForAdd,
          args.metadata
        );
        return JSON.stringify({
          success: true,
          message: "Memory added successfully",
          memoryId: result
        });
      } catch (error) {
        console.error('Error adding memory:', error);
        return JSON.stringify({
          error: "Failed to add memory",
          success: false
        });
      }

    case "deleteMemory":
      try {
        const result = await memoryService.deleteMemory(args.memoryId);
        return JSON.stringify(result);
      } catch (error) {
        console.error('Error deleting memory:', error);
        return JSON.stringify({
          error: "Failed to delete memory",
          success: false
        });
      }

    case "getRelevantMemories":
      const userIdForRelevant = await getCurrentUserId();
      if (!userIdForRelevant) {
        return JSON.stringify({
          error: "User not authenticated",
          memories: []
        });
      }
      
      try {
        const relevantMemories = await memoryService.getRelevantMemories(
          args.currentMessage,
          userIdForRelevant,
          args.conversationHistory || [],
          args.limit || 3
        );
        return JSON.stringify({
          memories: relevantMemories,
          count: Array.isArray(relevantMemories) ? relevantMemories.length : 0
        });
      } catch (error) {
        console.error('Error getting relevant memories:', error);
        return JSON.stringify({
          error: "Failed to get relevant memories",
          memories: []
        });
      }

    // Search functions
    case "searchWeb":
      try {
        console.log("Searching web with query:", args.query);
        const searchResponse = await tavilyService.search({
          query: args.query,
          topic: args.topic || 'general',
          max_results: Math.min(Math.max(args.max_results || 5, 1), 20),
          time_range: args.time_range,
          include_answer: args.include_answer !== false,
        });
        
        return JSON.stringify({
          success: true,
          query: searchResponse.query,
          answer: searchResponse.answer,
          results: searchResponse.results,
          response_time: searchResponse.response_time,
          formatted_results: tavilyService.formatSearchResults(searchResponse)
        });
      } catch (error) {
        console.error('Error searching web:', error);
        return JSON.stringify({
          error: "Failed to search the web",
          success: false,
          message: error instanceof Error ? error.message : "Unknown search error"
        });
      }

    case "searchNews":
      try {
        console.log("Searching news with query:", args.query);
        const newsResponse = await tavilyService.searchNews(
          args.query,
          Math.min(Math.max(args.max_results || 5, 1), 20),
          args.time_range || 'week'
        );
        
        return JSON.stringify({
          success: true,
          query: newsResponse.query,
          answer: newsResponse.answer,
          results: newsResponse.results,
          response_time: newsResponse.response_time,
          formatted_results: tavilyService.formatSearchResults(newsResponse)
        });
      } catch (error) {
        console.error('Error searching news:', error);
        return JSON.stringify({
          error: "Failed to search news",
          success: false,
          message: error instanceof Error ? error.message : "Unknown search error"
        });
      }

    case "getQuickAnswer":
      try {
        console.log("Getting quick answer with query:", args.query);
        const answer = await tavilyService.getQuickAnswer(args.query);
        
        return JSON.stringify({
          success: true,
          query: args.query,
          answer: answer
        });
      } catch (error) {
        console.error('Error getting quick answer:', error);
        return JSON.stringify({
          error: "Failed to get quick answer",
          success: false,
          message: error instanceof Error ? error.message : "Unknown search error"
        });
      }

    default:
      return JSON.stringify({
        error: `Unknown function: ${name}`,
        message: "This function is not supported."
      });
  }
}
