import { DBSchema } from 'idb';

// Define our database schema
export interface WeiDB extends DBSchema {
  habits: {
    key: string;
    value: {
      id: string;
      name: string;
      category: string;
      points: number;
      frequency: 'daily' | 'weekly' | 'monthly';
      createdAt: Date;
    };
    indexes: { 'by-category': string };
  };
  completions: {
    key: string;
    value: {
      id: string;
      habitId: string;
      completedAt: Date;
      points: number;
    };
    indexes: { 'by-habit': string; 'by-date': Date };
  };
  rewards: {
    key: string;
    value: {
      id: string;
      name: string;
      description: string;
      cost: number;
      createdAt: Date;
    };
  };
  rewardRedemptions: {
    key: string;
    value: {
      id: string;
      rewardId: string;
      redeemedAt: Date;
      cost: number;
    };
  };
  user: {
    key: string;
    value: {
      id: string;
      name: string;
      points: number;
      streakDays: number;
      lastActive: Date;
    };
  };
  conversations: {
    key: string;
    value: {
      id: string;
      messages: {
        id: string;
        sender: 'user' | 'wei';
        content: string;
        timestamp: Date;
      }[];
      createdAt: Date;
      updatedAt?: Date;
    };
  };
  userProfile: {
    key: string;
    value: {
      id: string;
      name: string;
      email: string;
      bio: string;
      avatarUrl: string;
      joinDate: string;
    };
  };
} 