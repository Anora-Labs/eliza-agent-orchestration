# Supabase Migration Guide

This document outlines how to migrate your habit tracking data from IndexedDB to Supabase.

## New Integrations Added

✅ **Mem0 AI Memory System** - Agents now remember conversations and user preferences  
✅ **Tavily Search Integration** - Real-time web search capabilities for current information

See `MEM0_INTEGRATION.md` and `TAVILY_SEARCH_INTEGRATION.md` for setup details.

## Current Status

✅ **User profiles** - Already using Supabase  
⚠️ **Habits, Rewards, Completions** - Currently using IndexedDB  

## Required Supabase Tables

To fully migrate to Supabase, you'll need to create the following tables in your Supabase database:

### 1. Habits Table

```sql
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own habits
CREATE POLICY "Users can view their own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);
```

### 2. Habit Completions Table

```sql
CREATE TABLE habit_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points INTEGER NOT NULL DEFAULT 1
);

-- Enable RLS
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own completions" ON habit_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions" ON habit_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions" ON habit_completions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own completions" ON habit_completions
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Rewards Table

```sql
CREATE TABLE rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cost INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own rewards" ON rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rewards" ON rewards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards" ON rewards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rewards" ON rewards
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. Reward Redemptions Table

```sql
CREATE TABLE reward_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cost INTEGER NOT NULL DEFAULT 1
);

-- Enable RLS
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own redemptions" ON reward_redemptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own redemptions" ON reward_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own redemptions" ON reward_redemptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own redemptions" ON reward_redemptions
  FOR DELETE USING (auth.uid() = user_id);
```

### 5. User Stats Table

```sql
CREATE TABLE user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  points INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);
```

## Migration Steps

### Step 1: Create Tables
Run the SQL commands above in your Supabase SQL editor.

### Step 2: Update Database Types
Update your `types/database.types.ts` file to include the new tables.

### Step 3: Uncomment Service Methods
In `lib/supabase/services.ts`, uncomment the implementation code for each method.

### Step 4: Update Components
Update components to use the Supabase service instead of IndexedDB:

```typescript
// Instead of:
import { useDatabase } from "@/app/contexts/DatabaseContext";

// Use:
import { supabaseDataService } from "@/lib/supabase/services";
```

### Step 5: Data Migration (Optional)
If you have existing data in IndexedDB, you can create a migration script to transfer it to Supabase.

## Benefits of Migration

- ✅ **Real-time sync** across devices
- ✅ **Better data persistence** 
- ✅ **Backup and recovery**
- ✅ **Advanced querying capabilities**
- ✅ **Built-in authentication integration**

## Current Implementation

The ProfileDashboard has been updated to:
- ✅ Use Supabase for user profile data (name, email, avatar)
- ⚠️ Still use IndexedDB for habits/rewards data (transitional)

Once you create the Supabase tables, you can fully migrate by updating the service calls in the components. 