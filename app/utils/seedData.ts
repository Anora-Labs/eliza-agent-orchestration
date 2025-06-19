"use client";

import { WeiDB } from "../types/database";
import { IDBPDatabase } from "idb";

export const sampleHabits: Omit<WeiDB['habits']['value'], 'id' | 'createdAt'>[] = [
  {
    name: "Morning Meditation",
    category: "Mental-Well-being",
    points: 3,
    frequency: "daily"
  },
  {
    name: "Drink Water (500ml)",
    category: "Nutrition & Hydration",
    points: 1,
    frequency: "daily"
  },
  {
    name: "30-min Exercise",
    category: "Physical Activity",
    points: 5,
    frequency: "daily"
  },
  {
    name: "Read 30 Minutes",
    category: "Deep Work / Learning",
    points: 4,
    frequency: "daily"
  },
  {
    name: "Home-cooked Meal",
    category: "Nutrition & Hydration",
    points: 5,
    frequency: "daily"
  }
];

export const sampleRewards: Omit<WeiDB['rewards']['value'], 'id' | 'createdAt'>[] = [
  {
    name: "1 Hour Gaming",
    description: "Take a break and play your favorite game for an hour",
    cost: 15
  },
  {
    name: "Social Media Break",
    description: "15 minutes of guilt-free social media browsing",
    cost: 5
  },
  {
    name: "Movie Night",
    description: "Enjoy a full movie with snacks",
    cost: 30
  },
  {
    name: "Order Takeout",
    description: "Skip cooking and order your favorite food",
    cost: 25
  },
  {
    name: "30-min Extra Sleep",
    description: "Sleep in for 30 minutes tomorrow morning",
    cost: 10
  }
];

export async function seedDatabase(db: IDBPDatabase<WeiDB>) {
  if (!db) return;
  
  // Check if we already have habits
  const existingHabits = await db.getAll('habits');
  if (existingHabits.length === 0) {
    // Add sample habits
    for (const habit of sampleHabits) {
      const id = `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.add('habits', {
        ...habit,
        id,
        createdAt: new Date()
      });
      // Short delay to ensure unique IDs
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  // Check if we already have rewards
  const existingRewards = await db.getAll('rewards');
  if (existingRewards.length === 0) {
    // Add sample rewards
    for (const reward of sampleRewards) {
      const id = `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.add('rewards', {
        ...reward,
        id,
        createdAt: new Date()
      });
      // Short delay to ensure unique IDs
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
} 