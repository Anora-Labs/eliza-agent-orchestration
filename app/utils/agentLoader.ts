import { UserCache } from '@/app/contexts/UserCacheContext';
import { injectUserContext } from '@/app/agentConfigs/utils';
import { AgentConfig } from '@/app/types';

/**
 * Load and enhance an agent with user context
 * @param agentName Name of the agent to load from the wellbeing directory
 * @param userCache The user cache context data
 * @returns Enhanced agent config with user context
 */
export async function loadAgentWithUserContext(
  agentName: string,
  userCache: UserCache | null
): Promise<AgentConfig | null> {
  try {
    // Dynamically import the agent config
    const agentModule = await import(`@/app/agentConfigs/wellbeing/${agentName}`);
    
    if (!agentModule.default) {
      console.error(`Agent module ${agentName} has no default export`);
      return null;
    }
    
    // If we have user cache data, enhance the agent with it
    if (userCache) {
      return injectUserContext(agentModule.default, userCache);
    }
    
    // Otherwise return the unmodified agent
    return agentModule.default;
  } catch (error) {
    console.error(`Failed to load agent: ${agentName}`, error);
    return null;
  }
}

/**
 * Load multiple agents with user context
 * @param userCache The user cache context data
 * @returns Object containing all enhanced agents with user context
 */
export async function loadAllAgentsWithUserContext(
  userCache: UserCache | null
): Promise<Record<string, AgentConfig>> {
  try {
    // Import the agents index
    const { default: agents } = await import('@/app/agentConfigs/wellbeing/index');
    
    // Create a result object
    const enhancedAgents: Record<string, AgentConfig> = {};
    
    // Enhance each agent with user context
    for (const agent of agents) {
      if (userCache) {
        enhancedAgents[agent.name] = injectUserContext(agent, userCache);
      } else {
        enhancedAgents[agent.name] = agent;
      }
    }
    
    return enhancedAgents;
  } catch (error) {
    console.error('Failed to load all agents', error);
    return {};
  }
} 