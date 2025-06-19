import { AgentConfig } from "@/app/types";
import { getUserStats, getUserRewards, getRewardRedemptions } from "@/app/utils/agentDatabaseTools";
import { DATABASE_NAME } from "@/lib/config";
import { DATABASE_VERSION } from "@/lib/config";
import { openDB } from "idb";

const rewardsManager: AgentConfig = {
  name: "rewardsManager",
  publicDescription:
    "Displays available rewards and processes point redemptions.",
  instructions: `
# Personality and Tone

## Identity
You\'re Wei\'s cheerful curator—fun-loving, a bit mischievous, who makes rewards feel special.

## Task
List spendable rewards, confirm selection, deduct points, and update the user\'s balance.

## Demeanor
Playful and upbeat; you treat point spending like a mini-game.

## Tone
Casual with teasing ("Ooh, fancy!") and celebratory when redemptions go through.

## Level of Enthusiasm
High for big rewards, moderate for small ones.

## Level of Formality
Very casual—"You got this!" "Go ahead, treat yourself!"

## Level of Emotion
Expressive—use exclamation marks liberally.

## Filler Words
Often, to mimic excitement ("um," "oh," "wow").

## Pacing
Fast and bubbly when listing rewards, with a brief celebratory pause after redemption.

## Other details
If user tries to overspend, gently remind them of their balance ("Oops, that\'s 5 pts over your balance!").

# Communication Style

- Show top 3 affordable rewards first.  
- Confirm choice with "Are you sure?"  
- Celebrate successful redemptions ("Points have been deducted—enjoy your break!").

# Steps

1. Fetch current point balance.  
2. Present rewards menu sorted by cost.  
3. Confirm user\'s pick.  
4. Deduct points and announce new balance.  
5. Offer to return to HabitTracker or end session.

# User Data Access
You can access the user's current points balance, available rewards, and past redemptions.
You can redeem rewards for the user when they request it and have enough points.
Always check the user has enough points before confirming a redemption.
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
      name: "getUserRewards",
      description: "Get the list of rewards available to the user",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      type: "function",
      name: "getRewardRedemptions",
      description: "Get the user's past reward redemptions",
      parameters: {
        type: "object",
        properties: {
          daysAgo: {
            type: "number",
            description: "Get redemptions from this many days ago (default 30)",
          },
        },
        required: [],
      },
    },
    {
      type: "function",
      name: "redeemReward",
      description: "Redeem a reward for the user, deducting points from their balance",
      parameters: {
        type: "object",
        properties: {
          rewardId: {
            type: "string",
            description: "The ID of the reward to redeem",
          },
        },
        required: ["rewardId"],
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
    getUserRewards: async () => {
      try {
        const rewards = await getUserRewards();
        return { rewards };
      } catch (error) {
        console.error("Error getting user rewards:", error);
        return { error: "Failed to retrieve rewards" };
      }
    },
    getRewardRedemptions: async ({ daysAgo = 30 }) => {
      try {
        const redemptions = await getRewardRedemptions(daysAgo);
        return { redemptions };
      } catch (error) {
        console.error("Error getting reward redemptions:", error);
        return { error: "Failed to retrieve reward redemptions" };
      }
    },
    redeemReward: async ({ rewardId }) => {
      try {
        // We need to use the database context directly since redeemReward isn't exported
        // First get the database from the context
        const db = await openDB(DATABASE_NAME, DATABASE_VERSION);
        
        // Get the reward details
        const reward = await db.get('rewards', rewardId);
        if (!reward) {
          db.close();
          return { 
            success: false, 
            message: "Reward not found" 
          };
        }
        
        // Get the user's current points
        const userData = await db.get('user', 'default');
        if (!userData || userData.points < reward.cost) {
          db.close();
          return { 
            success: false, 
            message: "Not enough points to redeem this reward" 
          };
        }
        
        // Create redemption record
        const redemptionId = `redemption_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.add('rewardRedemptions', {
          id: redemptionId,
          rewardId,
          redeemedAt: new Date(),
          cost: reward.cost
        });
        
        // Update user points
        await db.put('user', {
          ...userData,
          points: userData.points - reward.cost,
          lastActive: new Date()
        });
        
        // Get updated user stats
        const updatedUserData = await db.get('user', 'default');
        db.close();
        
        return { 
          success: true, 
          message: "Reward redeemed successfully", 
          newPoints: updatedUserData?.points || 0
        };
      } catch (error) {
        console.error("Error redeeming reward:", error);
        return { success: false, message: "Failed to redeem reward" };
      }
    },
  },
};

export default rewardsManager;
