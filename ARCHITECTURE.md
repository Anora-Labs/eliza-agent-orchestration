# Wei AI Assistant - Complete Architecture Documentation

## 🏗️ Architecture Overview

The Wei AI Assistant is an enterprise-grade AI platform that combines habit tracking, real-time AI interactions, persistent memory, web search capabilities, and comprehensive analytics. The architecture consists of multiple layers working together to provide a seamless user experience.

---

## 🧠 Core AI Infrastructure

### LLM Gateway (Keywords AI)
- **Primary LLM Provider**: Keywords AI proxy (`https://api.keywordsai.co/api`)
- **Fallback**: Direct OpenAI API
- **Models Available**: 250+ models (GPT-4o, Claude, Gemini, Llama, etc.)
- **Features**: Load balancing, retries, caching, rate limiting
- **Monitoring**: Real-time analytics, cost tracking, performance metrics

### Memory System (Mem0)
- **Provider**: Mem0 OSS with OpenAI embeddings
- **Storage**: Supabase (memory_history table)
- **Capabilities**: Conversation memory, user preferences, context retrieval
- **Vector Store**: In-memory with 1536-dimension embeddings
- **LLM**: GPT-4o-mini for memory processing

### Real-time Search (Tavily)
- **Provider**: Tavily Search API
- **Capabilities**: Web search, news search, quick answers
- **Features**: AI-generated summaries, source attribution, recency filtering
- **Integration**: Available to all agents via function calling

---

## 🤖 AI Agents Ecosystem

### Core Agents

#### 1. General Agent (`general.ts`)
**Purpose**: Primary wellness assistant and conversation manager
**Capabilities**:
- Habit tracking and completion
- Points and rewards management
- Memory operations (search, store, retrieve)
- Web search for health/wellness information
- User data access and management

**Available Functions**:
- `getUserData()` - Complete user profile and stats
- `completeHabit(habitId)` - Mark habits complete and award points
- `searchMemories(query)` - Search conversation history
- `getRelevantMemories(message, history)` - Contextual memory retrieval
- `addMemory(messages, metadata)` - Store important conversations
- `searchWeb(query, topic, maxResults)` - Real-time web search
- `searchNews(query, timeRange)` - Current events search
- `getQuickAnswer(query)` - Fast factual answers

#### 2. Habit Coach Agent (`wellbeing/habit-coach.ts`)
**Purpose**: Evidence-based habit formation coaching
**Capabilities**:
- Personalized habit strategies
- Scientific research retrieval
- Progress tracking and analysis
- Memory-based coaching continuity

**Enhanced Functions**:
- All general agent functions
- `searchWeb()` - For evidence-based research
- `getQuickAnswer()` - For habit science questions
- Specialized memory tracking for coaching strategies

#### 3. User Data Agent
**Purpose**: User profile and data management
**Capabilities**:
- Profile information access
- Data aggregation and insights
- Cross-session data continuity

#### 4. Points Calculator Agent
**Purpose**: Dynamic points calculation and rewards
**Capabilities**:
- Streak-based bonus calculations
- Difficulty-adjusted point awards
- Achievement milestone tracking

#### 5. Rewards Manager Agent
**Purpose**: Reward system management
**Capabilities**:
- Available rewards display
- Point redemption processing
- Reward recommendation logic

#### 6. Greeter Agent
**Purpose**: Personalized welcome experience
**Capabilities**:
- Context-aware greetings
- User preference recognition
- Onboarding assistance

---

## 🛠️ Tools & Functions Layer

### Database Functions
```typescript
// User & Profile Management
getUserData() -> Complete user profile, habits, stats
getUserProfile() -> User profile information
saveUserProfile(profile) -> Update user profile

// Habit Management
getUserHabits() -> All user habits
completeHabit(habitId) -> Mark complete, award points
getHabitCompletions(habitId, date) -> Completion history

// Rewards System
getUserRewards() -> Available rewards
redeemReward(rewardId) -> Process redemption
getRewardRedemptions() -> Redemption history

// Statistics & Analytics
getUserStats() -> Points, streaks, completion rates
calculateBonusPoints(habitId, basePoints) -> Dynamic bonuses
```

### Memory Functions
```typescript
// Memory Operations
searchMemories(query, userId, limit) -> Relevant memories
getAllMemories(userId) -> All user memories
addMemory(messages, userId, metadata) -> Store conversations
getRelevantMemories(message, userId, history) -> Context-aware retrieval
deleteMemory(memoryId) -> Remove specific memory
```

### Search Functions
```typescript
// Web Search Operations
searchWeb(query, topic, maxResults, timeRange) -> Live web search
searchNews(query, maxResults, timeRange) -> Current events
getQuickAnswer(query) -> Fast factual responses
```

### Analytics Functions
```typescript
// Keywords AI Tracking
trackHabitCompletion(userId, habitId, habitName, points)
trackMemoryOperation(userId, operation, metadata)
trackSearchOperation(userId, searchType, query, resultsCount)
trackAgentInteraction(userId, agentName, interactionType)
```

---

## 💾 Data Storage Architecture

### 1. Supabase (Primary Database)
**Tables**:
- `users` - User profiles and authentication
- `memory_history` - Mem0 conversation storage
- Row Level Security (RLS) enabled
- Real-time subscriptions available

**Configuration**:
- Authentication via Supabase Auth
- Service role for server-side operations
- Anon key for client-side operations

### 2. IndexedDB (Local Storage)
**Stores**:
- `habits` - User habits with categories and points
- `completions` - Habit completion records with timestamps
- `rewards` - Available rewards and redemption costs
- `rewardRedemptions` - Redemption history
- `user` - Local user data and points cache
- `conversations` - Local conversation backups
- `userProfile` - Cached profile information

**Features**:
- Offline capability
- Real-time sync with Supabase
- Automatic data seeding

### 3. Mem0 Vector Storage
**Components**:
- Vector embeddings (1536 dimensions)
- Conversation memories
- User preference storage
- Context retrieval system

---

## 🌐 API Layer

### Core API Endpoints

#### `/api/chat/completions` (POST)
**Purpose**: Main AI interaction endpoint
**Features**:
- Keywords AI proxy integration
- User tracking and analytics
- Function calling support
- Memory and search integration

**Request Parameters**:
```typescript
{
  model: string,
  messages: Array<{role, content}>,
  functions?: Array<Function>,
  userCache?: UserCacheData,
  customer_identifier?: string,
  thread_id?: string
}
```

#### `/api/auth/setup` (POST)
**Purpose**: User authentication setup
**Integration**: Supabase Auth

#### `/api/session` (GET/POST)
**Purpose**: Session management
**Features**: User state persistence

#### `/api/csrf` (GET)
**Purpose**: CSRF protection
**Security**: Request validation

---

## 🎨 User Interface Architecture

### Layout Structure
```
app/
├── layout.tsx (Root layout with user fetching)
├── info.tsx (Mobile-first responsive wrapper)
├── providers.tsx (Context providers hierarchy)
└── pages/
    ├── dashboard/ (Main dashboard)
    ├── chat/ (AI chat interface)
    ├── habits/ (Habit management)
    ├── rewards/ (Rewards system)
    └── profile/ (User profile)
```

### Context Providers Hierarchy
```typescript
UserProvider (Supabase user data)
  └── ThemeProvider
    └── EventProvider
      └── TranscriptProvider
        └── DatabaseProvider (IndexedDB)
          └── UserCacheProvider
            └── ChatProvider
              └── App Components
```

### Component Architecture
```
components/
├── auth/ (Authentication components)
├── chat/ (Chat interface components)
├── dashboard/ (Dashboard widgets)
├── habits/ (Habit management UI)
├── rewards/ (Rewards interface)
├── profile/ (Profile management)
└── ui/ (Reusable UI components)
```

---

## 🔄 Data Flow Architecture

### 1. User Authentication Flow
```
User Login → Supabase Auth → Root Layout → UserProvider → All Routes
```

### 2. Chat Interaction Flow
```
User Message → Chat Component → API Completions → Keywords AI Proxy → AI Agent
                                                        ↓
Memory Search ← Tavily Search ← Function Calls ← Agent Processing
                                                        ↓
Response → Keywords AI Analytics → Database Updates → UI Update
```

### 3. Habit Completion Flow
```
User Action → Habit Component → completeHabit() → IndexedDB Update
                                                        ↓
Points Calculation → Keywords AI Tracking → Agent Notification → UI Refresh
```

### 4. Memory Operation Flow
```
Conversation → Agent Processing → Memory Analysis → Mem0 Storage
                                                        ↓
Supabase Storage ← Keywords AI Analytics ← Context Retrieval
```

### 5. Search Operation Flow
```
User Query → Agent → Tavily API → Real-time Results → Keywords AI Tracking
                                                        ↓
Response Formatting → Memory Storage → UI Display
```

---

## 🔗 Integration Points

### Keywords AI Integration
**Connection Points**:
- All OpenAI API calls proxy through Keywords AI
- User identification for analytics
- Conversation threading
- Event tracking for app metrics
- Cost and performance monitoring

**Analytics Tracking**:
- Chat completions and function calls
- Search operations and effectiveness
- Memory operations and patterns
- User engagement and behavior
- Agent performance metrics

### Mem0 Integration
**Connection Points**:
- Agent conversation storage
- User preference learning
- Context-aware responses
- Cross-session continuity
- Personalization data

**Storage Flow**:
- Conversations → Mem0 Processing → Vector Embeddings → Supabase Storage

### Tavily Integration
**Connection Points**:
- Agent knowledge augmentation
- Real-time information access
- Evidence-based responses
- Current events awareness
- Research validation

**Search Flow**:
- Agent Query → Tavily API → Structured Results → Agent Response → User

---

## 🚀 Real-time Features

### Voice Streaming (WebRTC)
**Components**:
- `RealTimeStreamingMode.tsx` - Voice interface
- WebRTC connection management
- Real-time audio processing
- Voice-to-text conversion

**Flow**:
```
User Voice → WebRTC → Voice Processing → Text Conversion → Agent Processing → Voice Response
```

### Live Updates
**Features**:
- Real-time habit completion updates
- Live points and streak tracking
- Instant reward availability updates
- Real-time analytics dashboard

---

## 📊 Analytics & Monitoring

### Keywords AI Dashboard
**Metrics Tracked**:
- Request volume and patterns
- Token usage and costs
- Response times and success rates
- User behavior and engagement
- Agent effectiveness metrics
- Search operation analytics
- Memory operation patterns

### Custom Event Tracking
**Events**:
- `habit_completed` - Habit completion with points
- `memory_operation` - Memory add/search/retrieve
- `search_operation` - Web/news/quick answer searches
- `agent_interaction` - Agent chat/function/tool usage

### Performance Monitoring
**Metrics**:
- API response times
- Database query performance
- Memory retrieval speed
- Search operation latency
- User engagement patterns

---

## 🔒 Security Architecture

### Authentication
- **Provider**: Supabase Auth
- **Method**: JWT tokens with refresh
- **Scope**: User-isolated data access

### Data Security
- **Encryption**: In-transit and at-rest
- **Access Control**: Row Level Security (RLS)
- **API Security**: CSRF protection, rate limiting
- **Privacy**: User data isolation

### API Security
- **Authentication**: Bearer tokens
- **Rate Limiting**: Per-user limits
- **Input Validation**: Request sanitization
- **Error Handling**: Secure error responses

---

## 🌍 Environment Configuration

### Required Environment Variables
```bash
# Core AI Infrastructure
KEYWORDS_AI_API_KEY=xxx          # Primary LLM gateway + analytics
OPENAI_API_KEY=xxx               # Fallback LLM provider
TAVILY_API_KEY=xxx               # Real-time search capability

# Database & Storage
NEXT_PUBLIC_SUPABASE_URL=xxx     # Primary database
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx # Client-side database access
SUPABASE_SERVICE_ROLE=xxx        # Server-side database access

# Application Configuration
DATABASE_NAME=wei-app            # IndexedDB name
DATABASE_VERSION=1               # IndexedDB version
APP_TITLE=Wei AI Assistant       # Application title
```

### Deployment Architecture
- **Frontend**: Next.js app deployment
- **Database**: Supabase hosted PostgreSQL
- **Memory**: Mem0 with Supabase backend
- **Analytics**: Keywords AI cloud platform
- **Search**: Tavily cloud API

---

## 🔄 Data Synchronization

### Multi-Database Sync
```
Supabase (Primary) ↔ IndexedDB (Local Cache) ↔ Mem0 (Memory) ↔ Keywords AI (Analytics)
```

### Sync Strategies
- **Real-time**: Supabase subscriptions for live updates
- **Offline-first**: IndexedDB with background sync
- **Memory**: Automatic conversation storage
- **Analytics**: Async event tracking

---

## 📈 Scalability Architecture

### Horizontal Scaling Points
- **LLM Gateway**: Keywords AI handles load balancing
- **Database**: Supabase auto-scaling
- **Memory**: Mem0 distributed storage
- **Search**: Tavily managed infrastructure

### Performance Optimization
- **Caching**: Multiple levels (Browser, CDN, Database)
- **Lazy Loading**: Component and data lazy loading
- **Batching**: Request batching for efficiency
- **Compression**: Asset and response compression

---

## 🎯 Future Architecture Considerations

### Planned Enhancements
- **Multi-model AI**: Dynamic model selection per task
- **Advanced Analytics**: Predictive user behavior
- **Plugin System**: Extensible agent capabilities
- **Enterprise Features**: Team management, advanced analytics

### Architecture Evolution
- **Microservices**: Service decomposition for scale
- **Event Streaming**: Real-time event processing
- **Edge Computing**: Regional deployment optimization
- **API Gateway**: Centralized API management

---

## Key Architectural Improvements Made

### 1. User Data Architecture Fix
- **Problem**: User data only accessible on `/dashboard` route
- **Solution**: Moved user fetching to root `app/layout.tsx`
- **Result**: DRY principle compliance, user data available across all routes

### 2. Enhanced AI Capabilities
- **Memory**: Persistent conversation memory via Mem0
- **Search**: Real-time web search via Tavily
- **Analytics**: Complete LLM monitoring via Keywords AI
- **Models**: Access to 250+ AI models with load balancing

### 3. Enterprise-Grade Infrastructure
- **Monitoring**: Real-time performance and cost tracking
- **Security**: Multi-layer security with RLS and authentication
- **Scalability**: Auto-scaling components and managed services
- **Analytics**: User behavior and system performance insights

This comprehensive architecture enables Wei AI Assistant to provide personalized, current, and fully monitored AI interactions with enterprise-level observability and scalability.

1. **Core Infrastructure** - Keywords AI, Mem0, Tavily integrations
2. **AI Agents** - Enhanced with memory and search capabilities
3. **Data Storage** - Multi-layer storage architecture
4. **API Layer** - Enhanced endpoints with analytics
5. **UI Architecture** - Component and provider hierarchy
6. **Data Flows** - How data moves through the system
7. **Integrations** - How all services work together
8. **Security & Scalability** - Enterprise considerations
