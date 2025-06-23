# Tavily Search Integration Guide

This document explains how Tavily Search has been integrated into your Wei AI assistant app to provide real-time web search capabilities.

## What is Tavily Search?

Tavily Search is a search API specifically designed for AI agents that provides:
- Real-time web search capabilities
- AI-generated answers and summaries
- News and current events search
- Structured, agent-friendly results
- High-quality, relevant content extraction

## Features Added

### 🔍 **Search Service (`lib/tavily.ts`)**
- Complete Tavily API integration
- Multiple search modes: general, news, advanced
- Customizable search parameters
- Result formatting for AI consumption
- Error handling and fallbacks

### 🔧 **API Integration (`app/api/chat/completions/route.ts`)**
- New search functions available to all agents:
  - `searchWeb` - General web search with customizable parameters
  - `searchNews` - Recent news and current events search
  - `getQuickAnswer` - Fast factual question answering

### 🤖 **Enhanced Agents**
Updated agents with search capabilities:
- **General Agent** - Can search for health/wellness info and current events
- **Habit Coach** - Searches for evidence-based research and strategies

## Setup Instructions

### 1. Environment Variables
Add this to your `.env.local` file:

```bash
# Required for Tavily Search
TAVILY_API_KEY=your_tavily_api_key_here
```

### 2. Get Tavily API Key
1. Visit [Tavily API](https://tavily.com/)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add it to your environment variables

### 3. Test the Integration
1. Start your development server: `npm run dev`
2. Ask an agent a question requiring current information
3. Try commands like:
   - "What's the latest news about fitness trends?"
   - "Search for recent studies on habit formation"
   - "What are the current wellness trends?"

## Available Search Functions

### `searchWeb`
General web search with full customization options.

**Parameters:**
- `query` (required) - The search query
- `topic` - "general" or "news" (default: general)
- `max_results` - Number of results (1-20, default: 5)
- `time_range` - For news: "day", "week", "month", "year"
- `include_answer` - Include AI-generated summary (default: true)

**Example Usage:**
```
"Search for information about meditation benefits"
"Find recent research on sleep and productivity"
```

### `searchNews`
Specialized news and current events search.

**Parameters:**
- `query` (required) - The news search query
- `max_results` - Number of results (1-20, default: 5)
- `time_range` - "day", "week", "month" (default: week)

**Example Usage:**
```
"What's the latest news about mental health?"
"Find recent wellness industry updates"
```

### `getQuickAnswer`
Fast factual question answering.

**Parameters:**
- `query` (required) - The question to answer

**Example Usage:**
```
"How much sleep do adults need?"
"What is the recommended daily water intake?"
```

## Agent-Specific Enhancements

### General Agent Search Capabilities
- Real-time health and wellness information
- Current events related to fitness and lifestyle
- Factual questions about nutrition, exercise, sleep
- Latest trends in wellness and self-improvement

**Example Interactions:**
- User: "What are the latest fitness trends?"
- Agent: Searches for current fitness trends and provides updated information

### Habit Coach Search Capabilities
- Evidence-based research on habit formation
- Scientific studies on behavior change
- Current psychology research
- Wellness strategy validation

**Example Interactions:**
- User: "Is there research supporting morning routines?"
- Agent: Searches for scientific studies and provides evidence-based insights

## Search Result Quality

Tavily provides high-quality results with:
- **Relevance Scoring** - Results ranked by relevance to query
- **Content Extraction** - Clean, structured content snippets
- **Source Attribution** - URLs and titles for verification
- **AI Summaries** - Concise answers generated from multiple sources
- **Recency Filtering** - Recent results for time-sensitive queries

## Best Practices

### For Users
- Be specific in your queries for better results
- Ask for recent information when currency matters
- Request evidence-based information for health advice
- Follow up with clarifying questions if needed

### For Developers
- Use appropriate search functions for different query types
- Include error handling for search failures
- Format results clearly for user consumption
- Consider search costs and rate limits
- Cache results when appropriate

## Security & Privacy

- API keys are securely stored in environment variables
- Search queries are not logged or stored by default
- Results are provided in real-time without caching user data
- No personal information is sent to Tavily servers

## Rate Limits & Costs

- **Basic Search**: 1 API credit per request
- **Advanced Search**: 2 API credits per request
- **News Search**: 1 API credit per request
- **Rate Limits**: Depend on your Tavily plan

Monitor your usage through the Tavily dashboard.

## Error Handling

The integration includes comprehensive error handling:

```javascript
// Example error response
{
  "error": "Failed to search the web",
  "success": false,
  "message": "API rate limit exceeded"
}
```

Agents will gracefully handle search failures and inform users when real-time data is unavailable.

## Example Workflows

### Health Information Search
1. User asks: "What are the benefits of intermittent fasting?"
2. Agent uses `searchWeb` with health-focused query
3. Agent provides evidence-based answer with sources
4. Agent stores useful information in memory for future reference

### Current Events
1. User asks: "Any recent news about fitness apps?"
2. Agent uses `searchNews` with time filter
3. Agent summarizes recent developments
4. Agent relates findings to user's fitness goals

### Research Validation
1. User mentions a health claim
2. Agent searches for scientific validation
3. Agent provides evidence-based response
4. Agent suggests reliable sources for further reading

## Troubleshooting

### Common Issues

1. **Search not working**
   - Check TAVILY_API_KEY is set correctly
   - Verify API key has sufficient credits
   - Check internet connectivity

2. **Poor search results**
   - Make queries more specific
   - Try different search terms
   - Use appropriate search function for query type

3. **Rate limit errors**
   - Monitor API usage in Tavily dashboard
   - Implement caching for frequently asked questions
   - Upgrade Tavily plan if needed

### Debug Commands
Agents can help debug search issues:
- "Search for [topic]" - Test basic search functionality
- "Find news about [topic]" - Test news search
- "Quick answer: [question]" - Test quick answer feature

## Future Enhancements

Potential improvements to consider:
- Search result caching for common queries
- User search history and preferences
- Advanced search filters and operators
- Integration with domain-specific databases
- Search analytics and optimization

## Support

If you encounter issues with the Tavily Search integration:
1. Check the console logs for error messages
2. Verify your environment variables are correct
3. Test with simple queries first
4. Check Tavily API status and your account limits
5. Review the Tavily API documentation for updates 