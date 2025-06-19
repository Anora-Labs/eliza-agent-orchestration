/**
 * This is a simple test file demonstrating how to use user data in agents
 * To use this in a real application, import the needed functions and follow this pattern
 */

import { loadAgentWithUserContext } from '../utils/agentLoader';
import { UserCache } from '../contexts/UserCacheContext';

// Example function showing how to load an agent with user context
async function testUserDataAgent() {
  // 1. First, get user data (this would normally come from UserCacheContext)
  const mockUserCache: UserCache = {
    profile: {
      name: "Test User",
      bio: "I'm trying to build better habits!",
      joinDate: "2023-06-15"
    },
    habits: [
      { id: "habit1", name: "Morning Meditation", points: 10, category: "Wellness" },
      { id: "habit2", name: "Daily Exercise", points: 15, category: "Fitness" },
      { id: "habit3", name: "Read 30 Minutes", points: 5, category: "Learning" }
    ],
    completions: [
      { habitId: "habit1", completedAt: "2023-09-01", points: 10 },
      { habitId: "habit2", completedAt: "2023-09-01", points: 15 },
      { habitId: "habit3", completedAt: "2023-09-01", points: 5 }
    ],
    rewards: [
      { id: "reward1", name: "Movie Night", cost: 50 },
      { id: "reward2", name: "New Book", cost: 100 }
    ],
    redemptions: [
      { rewardId: "reward1", redeemedAt: "2023-08-25", cost: 50 }
    ],
    points: 235,
    streak: 7,
    recentActivity: [
      { action: "Completed", target: "Morning Meditation", date: "2023-09-01", points: 10 },
      { action: "Completed", target: "Daily Exercise", date: "2023-09-01", points: 15 },
      { action: "Redeemed", target: "Movie Night", date: "2023-08-25", points: -50 }
    ],
    lastUpdated: new Date()
  };

  // 2. Load the agent with user context
  const agent = await loadAgentWithUserContext('user-data-agent', mockUserCache);
  
  // 3. The agent now has:
  // - User context in its instructions
  // - User data access tools in its tools array
  
  console.log("Agent loaded with user context:", agent?.name);
  console.log("Number of tools:", agent?.tools.length);
  console.log("Tools available:", agent?.tools.map(tool => tool.name));
  
  // In a real app, this agent would be passed to the API with the userCache
  // to handle function calls for data access
}

// This is just a demonstration - in a real app you would integrate this
// with your API calls and agent loading logic
// testUserDataAgent().catch(console.error);

export default testUserDataAgent; 