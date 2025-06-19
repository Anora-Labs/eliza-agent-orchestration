import { IDBPDatabase } from 'idb';
import { WeiDB } from '../types/database';
import { initDB } from '@/lib/db';

/**
 * Provides utility functions to access database information for AI agents
 */

// Database cache to avoid reopening connections
let dbInstance: IDBPDatabase<WeiDB> | null = null;

// Get the database (reuse the existing connection if possible)
async function getDatabase() {
  try {
    if (!dbInstance) {
      dbInstance = await initDB();
    }
    return dbInstance;
  } catch (error) {
    console.error('Failed to open database for agent:', error);
    throw new Error('Database access failed');
  }
}

/**
 * Get user profile information
 * @param fields Optional array of field names to retrieve
 * @returns User profile data object
 */
export async function getUserProfile(fields?: string[]) {
  const db = await getDatabase();
  try {
    const profile = await db.get('userProfile', 'default');
    
    if (!profile) {
      return null;
    }
    
    if (!fields || fields.length === 0) {
      return profile;
    }
    
    // Return only requested fields
    const filteredProfile = {} as Record<string, any>;
    fields.forEach(field => {
      if (field in profile) {
        filteredProfile[field] = profile[field as keyof typeof profile];
      }
    });
    
    return filteredProfile;
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }
}

/**
 * Get user's habits
 */
export async function getUserHabits() {
  const db = await getDatabase();
  try {
    const habits = await db.getAll('habits');
    return habits || [];
  } catch (error) {
    console.error('Failed to get user habits:', error);
    return [];
  }
}

/**
 * Get user's habit completions
 */
export async function getHabitCompletions(daysAgo = 30) {
  const db = await getDatabase();
  try {
    const allCompletions = await db.getAll('completions');
    
    // Filter completions by date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    
    return allCompletions.filter(completion => 
      new Date(completion.completedAt) >= startDate
    );
  } catch (error) {
    console.error('Failed to get habit completions:', error);
    return [];
  }
}

/**
 * Get user's rewards
 */
export async function getUserRewards() {
  const db = await getDatabase();
  try {
    const rewards = await db.getAll('rewards');
    return rewards || [];
  } catch (error) {
    console.error('Failed to get user rewards:', error);
    return [];
  }
}

/**
 * Get user's reward redemptions
 */
export async function getRewardRedemptions(daysAgo = 30) {
  const db = await getDatabase();
  try {
    const allRedemptions = await db.getAll('rewardRedemptions');
    
    // Filter redemptions by date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    
    return allRedemptions.filter(redemption => 
      new Date(redemption.redeemedAt) >= startDate
    );
  } catch (error) {
    console.error('Failed to get reward redemptions:', error);
    return [];
  }
}

/**
 * Get user's points and streak information
 */
export async function getUserStats() {
  const db = await getDatabase();
  try {
    const userData = await db.get('user', 'default');
    return userData || { points: 0, streakDays: 0 };
  } catch (error) {
    console.error('Failed to get user stats:', error);
    return { points: 0, streakDays: 0 };
  }
}

/**
 * Complete a habit and update user points
 */
export async function completeHabit(habitId: string) {
  const db = await getDatabase();
  try {
    const habit = await db.get('habits', habitId);
    if (!habit) return { success: false, message: 'Habit not found' };
    
    // Create completion record
    const completionId = `completion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.add('completions', {
      id: completionId,
      habitId,
      completedAt: new Date(),
      points: habit.points
    });
    
    // Update user points
    const userData = await db.get('user', 'default');
    if (userData) {
      await db.put('user', {
        ...userData,
        points: userData.points + habit.points,
        lastActive: new Date()
      });
    }
    
    return { 
      success: true, 
      message: `Habit completed. Earned ${habit.points} points!`,
      newPoints: (userData?.points || 0) + habit.points
    };
  } catch (error) {
    console.error('Failed to complete habit:', error);
    return { success: false, message: 'Failed to complete habit' };
  }
}

/**
 * Get all user data combined for agent context
 */
export async function getUserDataForAgent() {
  try {
    const db = await getDatabase();
    
    // Fetch user profile data
    const user = await db.get('userProfile', 'default');
    if (!user) {
      return { error: "User profile not found" };
    }

    // Fetch user's habits
    const habits = await db.getAll('habits');
    
    // Fetch habit completions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const allCompletions = await db.getAll('completions');
    const completions = allCompletions.filter(completion => 
      new Date(completion.completedAt) >= thirtyDaysAgo
    );
    
    // Fetch rewards
    const rewards = await db.getAll('rewards');
    
    // Fetch redemptions
    const allRedemptions = await db.getAll('rewardRedemptions');
    const redemptions = allRedemptions.filter(redemption => 
      new Date(redemption.redeemedAt) >= thirtyDaysAgo
    );
    
    // Get user data for points
    const userData = await db.get('user', 'default');
    
    // Calculate streak
    const streak = calculateStreak(completions);
    
    // Format recent activities
    const recentActivity = formatRecentActivity(habits, completions, rewards, redemptions);
    
    return {
      profile: user,
      habits,
      completions,
      rewards,
      points: userData?.points || 0,
      streak,
      recentActivity
    };
  } catch (error) {
    console.error("Error getting user data from database:", error);
    return { error: "Failed to retrieve user data from database" };
  }
}

/**
 * Format recent activity for agent context (last 5 activities)
 */
function formatRecentActivity(
  habits: WeiDB['habits']['value'][], 
  completions: WeiDB['completions']['value'][], 
  rewards: WeiDB['rewards']['value'][], 
  redemptions: WeiDB['rewardRedemptions']['value'][]
) {
  // Define activity types
  type CompletionActivity = {
    type: 'completion';
    date: Date;
    points: number;
    details: {
      habitName: string;
      habitId: string;
    };
  };
  
  type RedemptionActivity = {
    type: 'redemption';
    date: Date;
    points: number;
    details: {
      rewardName: string;
      rewardId: string;
    };
  };
  
  type CombinedActivity = CompletionActivity | RedemptionActivity;
  
  // Combine completions and redemptions
  const allActivities: CombinedActivity[] = [
    ...completions.map(completion => {
      const habit = habits.find(h => h.id === completion.habitId);
      return {
        type: 'completion' as const,
        date: new Date(completion.completedAt),
        points: completion.points,
        details: {
          habitName: habit?.name || 'Unknown habit',
          habitId: completion.habitId
        }
      };
    }),
    ...redemptions.map(redemption => {
      const reward = rewards.find(r => r.id === redemption.rewardId);
      return {
        type: 'redemption' as const,
        date: new Date(redemption.redeemedAt),
        points: -redemption.cost,
        details: {
          rewardName: reward?.name || 'Unknown reward',
          rewardId: redemption.rewardId
        }
      };
    })
  ];
  
  // Sort by date (newest first)
  allActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Take the 5 most recent activities
  return allActivities.slice(0, 5).map(activity => {
    const formattedDate = activity.date.toLocaleDateString();
    
    if (activity.type === 'completion') {
      return {
        action: 'Completed',
        target: activity.details.habitName,
        date: formattedDate,
        points: activity.points
      };
    } else {
      return {
        action: 'Redeemed',
        target: activity.details.rewardName,
        date: formattedDate,
        points: activity.points
      };
    }
  });
}

/**
 * Calculates the user's current streak based on habit completions
 * @param completions Array of habit completions
 * @returns Number representing current streak
 */
function calculateStreak(completions: WeiDB['completions']['value'][]): number {
  if (!completions.length) return 0;
  
  // Sort completions by date (newest first)
  const sortedCompletions = [...completions].sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
  
  // Group completions by day
  const dailyCompletions = new Map<string, WeiDB['completions']['value'][]>();
  sortedCompletions.forEach(completion => {
    const date = new Date(completion.completedAt);
    const dateString = date.toISOString().split('T')[0];
    
    if (!dailyCompletions.has(dateString)) {
      dailyCompletions.set(dateString, []);
    }
    dailyCompletions.get(dateString)!.push(completion);
  });
  
  // Check if today has completions
  const today = new Date().toISOString().split('T')[0];
  const hasCompletionToday = dailyCompletions.has(today);
  
  // Calculate streak
  let currentStreak = hasCompletionToday ? 1 : 0;
  const dates = Array.from(dailyCompletions.keys()).sort().reverse();
  
  if (dates.length <= 1) return currentStreak;
  
  // Start from yesterday if we have a completion today
  const startIndex = hasCompletionToday ? 1 : 0;
  
  for (let i = startIndex; i < dates.length; i++) {
    const currentDate = new Date(dates[i]);
    const previousDate = new Date(dates[i-1]);
    
    // Calculate difference in days
    const diffTime = previousDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If the difference is exactly 1 day, continue the streak
    if (diffDays === 1) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  return currentStreak;
}
