import { AgentConfig, Tool } from "@/app/types";
import { UserCache } from "@/app/contexts/UserCacheContext";

/**
 * This defines and adds "transferAgents" tool dynamically based on the specified downstreamAgents on each agent.
 */
export function injectTransferTools(agentDefs: AgentConfig[]): AgentConfig[] {
  // Iterate over each agent definition
  agentDefs.forEach((agentDef) => {
    const downstreamAgents = agentDef.downstreamAgents || [];

    // Only proceed if there are downstream agents
    if (downstreamAgents.length > 0) {
      // Build a list of downstream agents and their descriptions for the prompt
      const availableAgentsList = downstreamAgents
        .map(
          (dAgent) =>
            `- ${dAgent.name}: ${dAgent.publicDescription ?? "No description"}`
        )
        .join("\n");

      // Create the transfer_agent tool specific to this agent
      const transferAgentTool: Tool = {
        type: "function",
        name: "transferAgents",
        description: `Triggers a transfer of the user to a more specialized agent. 
  Calls escalate to a more specialized LLM agent or to a human agent, with additional context. 
  Only call this function if one of the available agents is appropriate. Don't transfer to your own agent type.
  
  Let the user know you're about to transfer them before doing so.
  
  Available Agents:
  ${availableAgentsList}
        `,
        parameters: {
          type: "object",
          properties: {
            rationale_for_transfer: {
              type: "string",
              description: "The reasoning why this transfer is needed.",
            },
            conversation_context: {
              type: "string",
              description:
                "Relevant context from the conversation that will help the recipient perform the correct action.",
            },
            destination_agent: {
              type: "string",
              description:
                "The more specialized destination_agent that should handle the user's intended request.",
              enum: downstreamAgents.map((dAgent) => dAgent.name),
            },
          },
          required: [
            "rationale_for_transfer",
            "conversation_context",
            "destination_agent",
          ],
        },
      };

      // Ensure the agent has a tools array
      if (!agentDef.tools) {
        agentDef.tools = [];
      }

      // Add the newly created tool to the current agent's tools
      agentDef.tools.push(transferAgentTool);
    }

    // so .stringify doesn't break with circular dependencies
    agentDef.downstreamAgents = agentDef.downstreamAgents?.map(
      ({ name, publicDescription }) => ({
        name,
        publicDescription,
      })
    );
  });

  return agentDefs;
}

/**
 * Enhances agent instructions with user data from cache
 * This allows agents to have personalized context about the user
 * Also adds user data access tools to the agent
 */
export function injectUserContext(agentDef: AgentConfig, userCache: UserCache): AgentConfig {
  // Create a deep copy to avoid mutating the original
  const enhancedAgent = { ...agentDef };
  
  if (!userCache) {
    return enhancedAgent;
  }
  
  // Create a user context section to append to instructions
  const userContextBlock = createUserContextBlock(userCache);
  
  // Append the user context to the agent's instructions
  if (enhancedAgent.instructions) {
    enhancedAgent.instructions = `${enhancedAgent.instructions}\n\n# User Context\n${userContextBlock}`;
  }
  
  // Add user data access tools
  const userDataTools = createUserDataTools();
  
  // Ensure the agent has a tools array
  if (!enhancedAgent.tools) {
    enhancedAgent.tools = [];
  }
  
  // Add user data tools to the agent's tools
  enhancedAgent.tools.push(...userDataTools);
  
  return enhancedAgent;
}

/**
 * Creates a formatted block of user context from cache data
 * Optimized to provide concise but useful information
 */
function createUserContextBlock(userCache: UserCache): string {
  if (!userCache) {
    return "No user data available.";
  }
  
  let contextBlock = '';
  
  // Add user profile information
  if (userCache.profile) {
    contextBlock += `## User Profile\n`;
    contextBlock += `- Name: ${userCache.profile.name || 'Unknown'}\n`;
    if (userCache.profile.bio) contextBlock += `- Bio: ${userCache.profile.bio}\n`;
    contextBlock += `- Member since: ${userCache.profile.joinDate || 'Unknown'}\n\n`;
  }
  
  // Add points and streak information (most frequently asked)
  contextBlock += `## Summary Stats\n`;
  contextBlock += `- Current points: ${userCache.points || 0}\n`;
  contextBlock += `- Current streak: ${userCache.streak || 0} days\n`;
  
  // Add habit count and category summary (not full details)
  if (userCache.habits && userCache.habits.length > 0) {
    const habitCategories = userCache.habits.reduce((acc: Record<string, number>, habit: any) => {
      const category = habit.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    contextBlock += `- Active habits: ${userCache.habits.length} habits\n`;
    contextBlock += `- Categories: ${Object.entries(habitCategories).map(([cat, count]) => `${cat} (${count})`).join(', ')}\n\n`;
  }
  
  // Add just 2-3 recent activities as examples (not all)
  if (userCache.recentActivity && userCache.recentActivity.length > 0) {
    contextBlock += `## Recent Activity Examples\n`;
    userCache.recentActivity.slice(0, 3).forEach((activity: any) => {
      contextBlock += `- ${activity.action} "${activity.target}" (${activity.points > 0 ? '+' : ''}${activity.points} points) on ${activity.date}\n`;
    });
    contextBlock += '\n';
  }
  
  // Add note about available tools
  contextBlock += `*Note: For detailed user information, use the provided user data access functions.*\n`;
  
  return contextBlock;
}

/**
 * Creates a set of tools that allow the agent to access specific user data
 * Note: The actual implementation of these tools is in the API route handler
 */
function createUserDataTools(): Tool[] {
  // Prepare the tools array
  const tools: Tool[] = [];
  
  // Get user profile info
  const getUserProfileTool: Tool = {
    type: "function",
    name: "getUserProfile",
    description: "Get detailed user profile information",
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
  };
  tools.push(getUserProfileTool);
  
  // Get user points and streak
  const getUserStatsTool: Tool = {
    type: "function",
    name: "getUserStats",
    description: "Get user's current points and streak information",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  };
  tools.push(getUserStatsTool);
  
  // Get user habits
  const getUserHabitsTool: Tool = {
    type: "function",
    name: "getUserHabits",
    description: "Get list of user's active habits with details",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Optional category to filter habits by"
        }
      },
      required: []
    }
  };
  tools.push(getUserHabitsTool);
  
  // Get user recent activity
  const getUserActivityTool: Tool = {
    type: "function",
    name: "getRecentActivity",
    description: "Get user's recent activity history",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of activities to return (defaults to 5)"
        },
        activityType: {
          type: "string",
          description: "Filter by activity type ('Completed' or 'Redeemed')"
        }
      },
      required: []
    }
  };
  tools.push(getUserActivityTool);
  
  // Get user rewards
  const getUserRewardsTool: Tool = {
    type: "function",
    name: "getUserRewards",
    description: "Get user's available rewards",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  };
  tools.push(getUserRewardsTool);
  
  // Get reward redemptions
  const getRewardRedemptionsTool: Tool = {
    type: "function",
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
  };
  tools.push(getRewardRedemptionsTool);
  
  return tools;
}
