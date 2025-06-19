"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { WeiDB } from '../types/database';
import { useDatabase } from './DatabaseContext';

export interface UserCache {
  profile: any;
  habits: any[];
  completions: any[];
  rewards: any[];
  redemptions: any[];
  points: number;
  streak: number;
  recentActivity: any[];
  lastUpdated: Date;
}

interface UserCacheContextType {
  cache: UserCache | null;
  isLoading: boolean;
  error: Error | null;
  refreshCache: () => Promise<void>;
}

const UserCacheContext = createContext<UserCacheContextType | null>(null);

export const useUserCache = () => {
  const context = useContext(UserCacheContext);
  if (!context) {
    throw new Error('useUserCache must be used within a UserCacheProvider');
  }
  return context;
};

export const UserCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db, isLoading: dbLoading } = useDatabase();
  const [cache, setCache] = useState<UserCache | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserData = async () => {
    if (!db) {
      console.warn('UserCacheProvider: Database not available yet');
      return;
    }
    
    setIsLoading(true);
    try {
      // Get user profile
      const profile = await db.get('userProfile', 'default');
      
      // Get user stats
      const userData = await db.get('user', 'default');
      
      // Get habits
      const habits = await db.getAll('habits');
      
      // Get all completions
      const allCompletions = await db.getAll('completions');
      
      // Filter recent completions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const completions = allCompletions.filter(
        completion => new Date(completion.completedAt) >= thirtyDaysAgo
      );
      
      // Get rewards
      const rewards = await db.getAll('rewards');
      
      // Get redemptions (last 30 days)
      const allRedemptions = await db.getAll('rewardRedemptions');
      const redemptions = allRedemptions.filter(
        redemption => new Date(redemption.redeemedAt) >= thirtyDaysAgo
      );
      
      // Calculate streak
      const streakDays = userData?.streakDays || 0;
      
      // Format recent activity
      const recentActivity = formatRecentActivity(habits, completions, rewards, redemptions);
      
      // Create the cache object
      const newCache: UserCache = {
        profile: profile || {},
        habits: habits || [],
        completions: completions || [],
        rewards: rewards || [],
        redemptions: redemptions || [],
        points: userData?.points || 0,
        streak: streakDays,
        recentActivity,
        lastUpdated: new Date()
      };
      
      setCache(newCache);
    } catch (err) {
      console.error('Failed to fetch user data for cache:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching user data'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Define activity types for type safety
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
  
  type Activity = CompletionActivity | RedemptionActivity;
  
  // Format recent activity for cache
  function formatRecentActivity(
    habits: WeiDB['habits']['value'][], 
    completions: WeiDB['completions']['value'][], 
    rewards: WeiDB['rewards']['value'][], 
    redemptions: WeiDB['rewardRedemptions']['value'][]
  ) {
    // Combine completions and redemptions
    const allActivities: Activity[] = [
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

  // Initialize cache when database is available
  useEffect(() => {
    if (db && !dbLoading) {
      fetchUserData();
      
      // Refresh cache every 5 minutes
      const intervalId = setInterval(fetchUserData, 5 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [db, dbLoading]);

  const refreshCache = async () => {
    await fetchUserData();
  };

  return (
    <UserCacheContext.Provider value={{ cache, isLoading, error, refreshCache }}>
      {children}
    </UserCacheContext.Provider>
  );
}; 