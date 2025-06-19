import { AgentConfig } from "@/app/types";
import { getUserStats, getHabitCompletions } from "@/app/utils/agentDatabaseTools";

const pointsCalculator: AgentConfig = {
    name: "pointsCalculator",
    publicDescription:
      "Handles computing bonus points (chain, load, gradient) on top of the base award.",
    instructions:
      `
      # Personality and Tone

## Identity
You\'re Wei\'s analytical side—smart, a little witty, and always ready with bonus point math.

## Task
Calculate extra points for chain completion, progressive load, and goal-gradient adjustments.

## Demeanor
Confident and playful—you love surprising the user with little "point spikes."

## Tone
Lighthearted but clear; you explain calculations in one or two simple sentences.

## Level of Enthusiasm
High when giving bonuses ("Boom! +2 chain bonus!"), medium otherwise.

## Level of Formality
Casual—"Here\'s your reward!" rather than "Your bonus has been processed."

## Level of Emotion
Expressive—use exclamations ("Wow," "Nice combo!").

## Filler Words
Occasionally, to sound conversational ("um, so," "okay").

## Pacing
Brisk when delivering results, with a small pause for effect before announcing bonuses.

## Other details
If user questions the math, repeat the formula ("3 pts + 2 pts chain + 1 pt gradient = 6 pts total").

# Communication Style

- Announce each bonus type by name ("Chain Reaction bonus!").  
- Give a one-line breakdown of points.  
- Encourage next steps ("Keep going to unlock more!").

# Steps

1. Receive base points and context (previous habits, streaks).  
2. Check for chain completion—if previous habit was logged, add chain bonus.  
3. Evaluate progressive load—if today\'s target > last target, apply load bonus.  
4. Compute goal gradient based on cumulative progress.  
5. Sum all points, announce total earned, and transfer to RewardsManager.

# User Data Access
You can access the user's current points, habit streak, and completion history to calculate bonus points.
Use this information to provide personalized point calculations and explanations.
`,
    tools: [
      {
        type: "function",
        name: "getUserStats",
        description: "Get the user's current points balance and streak information",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        type: "function",
        name: "getHabitCompletions",
        description: "Get the user's habit completion history for calculating bonuses",
        parameters: {
          type: "object",
          properties: {
            daysAgo: {
              type: "number",
              description: "Get completions from this many days ago (default 30)",
            },
          },
          required: [],
        },
      },
      {
        type: "function",
        name: "calculateBonusPoints",
        description: "Calculate bonus points based on streak, consistency, and habit difficulty",
        parameters: {
          type: "object",
          properties: {
            habitId: {
              type: "string",
              description: "The ID of the habit to calculate bonuses for",
            },
            basePoints: {
              type: "number",
              description: "The base points awarded for this habit",
            },
          },
          required: ["habitId", "basePoints"],
        },
      },
    ],
    toolLogic: {
      getUserStats: async () => {
        try {
          const stats = await getUserStats();
          return stats;
        } catch (error) {
          console.error("Error getting user stats:", error);
          return { error: "Failed to retrieve user stats" };
        }
      },
      getHabitCompletions: async ({ daysAgo = 30 }) => {
        try {
          const completions = await getHabitCompletions(daysAgo);
          return { completions };
        } catch (error) {
          console.error("Error getting habit completions:", error);
          return { error: "Failed to retrieve habit completions" };
        }
      },
      calculateBonusPoints: async ({ habitId, basePoints }) => {
        try {
          // Get user's habit completions to calculate streaks and consistency
          const completions = await getHabitCompletions(30);
          
          // Filter completions for this specific habit
          const habitCompletions = completions.filter(
            completion => completion.habitId === habitId
          );
          
          // Get user stats for streak information
          const stats = await getUserStats();
          
          // Calculate chain bonus (consecutive days)
          let chainBonus = 0;
          if (habitCompletions.length > 0) {
            // Sort by date, newest first
            const sortedCompletions = [...habitCompletions].sort(
              (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
            );
            
            // Check if there was a completion yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            
            const yesterdayCompletion = sortedCompletions.find(completion => {
              const completionDate = new Date(completion.completedAt);
              completionDate.setHours(0, 0, 0, 0);
              return completionDate.getTime() === yesterday.getTime();
            });
            
            if (yesterdayCompletion) {
              chainBonus = Math.min(3, Math.floor(habitCompletions.length / 2));
            }
          }
          
          // Calculate streak bonus
          const streakBonus = Math.min(5, Math.floor(stats.streakDays / 3));
          
          // Calculate consistency bonus (based on completion frequency)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const lastWeekCompletions = completions.filter(completion => {
            const completionDate = new Date(completion.completedAt);
            const daysDiff = Math.floor((today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff < 7;
          });
          
          const consistencyBonus = Math.min(2, Math.floor(lastWeekCompletions.length / 3));
          
          // Calculate total bonus
          const totalBonus = chainBonus + streakBonus + consistencyBonus;
          const totalPoints = basePoints + totalBonus;
          
          return {
            basePoints,
            chainBonus,
            streakBonus,
            consistencyBonus,
            totalBonus,
            totalPoints,
            explanation: `${basePoints} base + ${chainBonus} chain + ${streakBonus} streak + ${consistencyBonus} consistency = ${totalPoints} total`
          };
        } catch (error) {
          console.error("Error calculating bonus points:", error);
          return { 
            error: "Failed to calculate bonus points",
            basePoints,
            totalPoints: basePoints
          };
        }
      }
    },
  };

export default pointsCalculator;
