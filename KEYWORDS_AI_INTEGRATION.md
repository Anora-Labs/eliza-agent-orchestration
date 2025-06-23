# Keywords AI Integration Guide

This document explains how Keywords AI has been integrated into your Wei AI assistant app to provide comprehensive LLM monitoring, analytics, and access to 250+ AI models.

## What is Keywords AI?

Keywords AI is a full-stack LLM engineering platform that provides:
- **AI Observability** - Monitoring, logging, tracing, and user analytics
- **Prompt Management** - Version control, editing, metrics, and playground
- **Evaluations** - Prompt experiments, offline evals, human & LLM evaluations
- **LLM Gateway** - Access to 250+ AI models with load balancing and fallbacks

## Features Added

### 🎯 **Core Integration**
- **OpenAI Client Proxy** - All API calls now route through Keywords AI
- **User Tracking** - Individual user identification and analytics
- **Conversation Threading** - Thread-based conversation tracking
- **Event Tracking** - Custom event tracking for app-specific analytics

### 📊 **Analytics & Monitoring**
- **Real-time Metrics** - Token usage, costs, response times
- **User Analytics** - Individual user behavior and usage patterns
- **Agent Performance** - Track which agents are most effective
- **Search Analytics** - Monitor web search usage and effectiveness

## Setup Instructions

### 1. Environment Variables
Add to your `.env.local` file:

```bash
# Required for Keywords AI
KEYWORDS_AI_API_KEY=your_keywords_ai_api_key_here

# Optional: Fallback to direct OpenAI
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Get Keywords AI API Key
1. Visit [Keywords AI](https://keywordsai.co/)
2. Sign up for an account
3. Create an API key in the dashboard
4. Add it to your environment variables

### 3. Verify Integration
1. Start your app: `npm run dev`
2. Have conversations with agents
3. Check your Keywords AI dashboard for analytics

## Key Benefits

✅ **Complete Observability** - See exactly how your AI performs  
✅ **Cost Optimization** - Track and optimize AI spending  
✅ **User Analytics** - Understand user behavior patterns  
✅ **Model Flexibility** - Access to 250+ AI models  
✅ **Production Monitoring** - Enterprise-grade monitoring

Your AI assistant is now enterprise-ready! 🚀 