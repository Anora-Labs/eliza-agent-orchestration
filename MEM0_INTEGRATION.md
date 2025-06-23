# Mem0 Integration Guide

This document explains how Mem0 (AI agent memory) has been integrated into your Wei AI assistant app.

## What is Mem0?

Mem0 is a memory management system for AI agents that allows them to:
- Remember previous conversations with users
- Store and retrieve context across sessions
- Provide personalized interactions based on history
- Learn user preferences and adapt over time

## Features Added

### 🧠 **Memory Service (`lib/memory.ts`)**
- Complete Mem0 integration with OpenAI embeddings
- Supabase as history store for serverless compatibility
- Functions for adding, searching, updating, and deleting memories
- Intelligent memory retrieval for conversation context

### 🔧 **API Integration (`app/api/chat/completions/route.ts`)**
- New memory-related functions available to all agents:
  - `searchMemories` - Search through user's conversation history
  - `getAllMemories` - Retrieve all memories for a user
  - `addMemory` - Store important conversation details
  - `deleteMemory` - Remove specific memories
  - `getRelevantMemories` - Get contextually relevant memories

### 🤖 **Enhanced Agents**
Updated agents with memory capabilities:
- **General Agent** - Now remembers user preferences and habits
- **Habit Coach** - Stores successful coaching strategies and user patterns

## Setup Instructions

### 1. Environment Variables
Add these to your `.env.local` file:

```bash
# Required for Mem0
OPENAI_API_KEY=your_openai_api_key_here
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key

# Already existing
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup
Run the SQL from `supabase-memory-migration.sql` in your Supabase SQL Editor to create the memory_history table.

### 3. Test the Integration
1. Start your development server: `npm run dev`
2. Have a conversation with any agent
3. Ask the agent to remember something important
4. In a new conversation, reference what was remembered

## How It Works

### Memory Storage
When agents interact with users, they can automatically store important information.

### Memory Retrieval
Before responding, agents can search for relevant context from previous conversations.

### Automatic Context
The system automatically finds memories related to the current conversation context.

## Security & Privacy

- All memories are isolated by user ID
- Supabase RLS policies ensure data security
- Users can delete their memories through agent commands
- Memory data is encrypted in transit and at rest 