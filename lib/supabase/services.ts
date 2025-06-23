import { createClient } from "./client";
import { Database } from "@/types/database.types";

// Define types for our data structures (these would match Supabase tables)
export interface Habit {
  id: string;
  user_id: string;
  name: string;
  category: string;
  points: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  created_at: string;
}

export interface HabitCompletion {
  id: string;
  user_id: string;
  habit_id: string;
  completed_at: string;
  points: number;
}

export interface Reward {
  id: string;
  user_id: string;
  name: string;
  description: string;
  cost: number;
  created_at: string;
}

export interface RewardRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  redeemed_at: string;
  cost: number;
}

export interface UserStats {
  id: string;
  user_id: string;
  points: number;
  streak_days: number;
  last_active: string;
}

// Service class for Supabase operations
export class SupabaseDataService {
  private supabase = createClient();

  // Get current user ID
  private async getCurrentUserId(): Promise<string | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error || !user) {
      console.error('Error getting current user:', error);
      return null;
    }
    return user.id;
  }

  // Habits
  async getHabits(): Promise<Habit[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) return [];

    // Note: This would require a 'habits' table in Supabase
    // For now, we'll return empty array as the table doesn't exist yet
    console.warn('Supabase habits table not implemented yet');
    return [];
    
    // When implemented, would look like:
    /*
    const { data, error } = await this.supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching habits:', error);
      return [];
    }

    return data || [];
    */
  }

  async addHabit(habit: Omit<Habit, 'id' | 'user_id' | 'created_at'>): Promise<string | null> {
    const userId = await this.getCurrentUserId();
    if (!userId) return null;

    console.warn('Supabase habits table not implemented yet');
    return null;

    // When implemented:
    /*
    const { data, error } = await this.supabase
      .from('habits')
      .insert([{
        ...habit,
        user_id: userId,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding habit:', error);
      return null;
    }

    return data?.id || null;
    */
  }

  // Habit Completions
  async getCompletions(habitId?: string, date?: Date): Promise<HabitCompletion[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) return [];

    console.warn('Supabase completions table not implemented yet');
    return [];

    // When implemented:
    /*
    let query = this.supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', userId);

    if (habitId) {
      query = query.eq('habit_id', habitId);
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query
        .gte('completed_at', startOfDay.toISOString())
        .lte('completed_at', endOfDay.toISOString());
    }

    const { data, error } = await query
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching completions:', error);
      return [];
    }

    return data || [];
    */
  }

  async completeHabit(habitId: string): Promise<{ success: boolean; message: string; newPoints?: number }> {
    const userId = await this.getCurrentUserId();
    if (!userId) return { success: false, message: 'User not authenticated' };

    console.warn('Supabase habit completion not implemented yet');
    return { success: false, message: 'Supabase tables not implemented yet' };

    // When implemented:
    /*
    // Get habit details
    const { data: habit, error: habitError } = await this.supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .eq('user_id', userId)
      .single();

    if (habitError || !habit) {
      return { success: false, message: 'Habit not found' };
    }

    // Add completion record
    const { error: completionError } = await this.supabase
      .from('habit_completions')
      .insert([{
        habit_id: habitId,
        user_id: userId,
        completed_at: new Date().toISOString(),
        points: habit.points
      }]);

    if (completionError) {
      console.error('Error adding completion:', completionError);
      return { success: false, message: 'Failed to record completion' };
    }

    // Update user stats
    const { data: stats, error: statsError } = await this.supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (stats) {
      const { error: updateError } = await this.supabase
        .from('user_stats')
        .update({
          points: stats.points + habit.points,
          last_active: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating stats:', updateError);
      }

      return { 
        success: true, 
        message: `Habit completed! Earned ${habit.points} points.`,
        newPoints: stats.points + habit.points
      };
    }

    return { success: true, message: 'Habit completed!' };
    */
  }

  // Rewards
  async getRewards(): Promise<Reward[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) return [];

    console.warn('Supabase rewards table not implemented yet');
    return [];
  }

  async getRewardRedemptions(): Promise<RewardRedemption[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) return [];

    console.warn('Supabase reward_redemptions table not implemented yet');
    return [];
  }

  // User Stats
  async getUserStats(): Promise<UserStats | null> {
    const userId = await this.getCurrentUserId();
    if (!userId) return null;

    console.warn('Supabase user_stats table not implemented yet');
    return null;

    // When implemented:
    /*
    const { data, error } = await this.supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }

    return data;
    */
  }

  // Calculate recent activity combining completions and redemptions
  async getRecentActivity(limit: number = 5): Promise<Array<{
    id: string;
    action: string;
    target: string;
    date: string;
    points: number;
  }>> {
    const userId = await this.getCurrentUserId();
    if (!userId) return [];

    console.warn('Supabase recent activity not implemented yet - tables do not exist');
    return [];

    // When implemented, this would fetch completions and redemptions,
    // combine them, sort by date, and return the most recent activities
  }

  // Calculate achievements based on user data
  async getAchievements(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    earned: boolean;
  }>> {
    const userId = await this.getCurrentUserId();
    if (!userId) return [];

    console.warn('Supabase achievements calculation not implemented yet');
    return [];

    // When implemented, this would:
    // 1. Fetch user's completions
    // 2. Calculate various achievements based on completion patterns
    // 3. Return achievement status
  }
}

// Export a singleton instance
export const supabaseDataService = new SupabaseDataService(); 