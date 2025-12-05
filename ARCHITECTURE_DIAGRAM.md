# 🏗️ CMIS Event Management System - Architecture Diagram

## System Architecture Overview

This document provides a comprehensive architectural diagram of the CMIS Event Management System for presentation purposes.

---

## High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser<br/>Next.js 14 App Router]
        MOBILE[Mobile Browser<br/>Responsive UI]
    end

    subgraph "Frontend Application"
        NEXT[Next.js Application<br/>TypeScript + React]
        UI[UI Components<br/>shadcn/ui + Tailwind]
        STATE[State Management<br/>Zustand + React Query]
    end

    subgraph "API Layer"
        TRPC[tRPC API<br/>Type-Safe Endpoints]
        REST[REST API Routes<br/>Next.js API Routes]
    end

    subgraph "Backend Services"
        AUTH[Authentication Service<br/>Supabase Auth]
        EMAIL[Email Service<br/>Resend API]
        STORAGE[File Storage<br/>Supabase Storage]
        AI[AI Chat Service<br/>OpenAI/Gemini]
        QUEUE[Email Queue<br/>Upstash Redis]
    end

    subgraph "Database Layer"
        POSTGRES[(PostgreSQL Database<br/>Supabase)]
        RLS[Row-Level Security<br/>RLS Policies]
        FUNCTIONS[Database Functions<br/>PostgreSQL Functions]
    end

    subgraph "External Services"
        RESEND[Resend<br/>Email Delivery]
        SUPABASE[Supabase<br/>BaaS Platform]
        UPSTASH[Upstash<br/>Redis Cache]
        OPENAI[OpenAI/Gemini<br/>AI Services]
    end

    WEB --> NEXT
    MOBILE --> NEXT
    NEXT --> UI
    NEXT --> STATE
    NEXT --> TRPC
    NEXT --> REST

    TRPC --> AUTH
    TRPC --> EMAIL
    TRPC --> STORAGE
    TRPC --> AI
    TRPC --> QUEUE
    TRPC --> POSTGRES

    REST --> EMAIL
    REST --> STORAGE
    REST --> AI

    AUTH --> SUPABASE
    EMAIL --> RESEND
    STORAGE --> SUPABASE
    QUEUE --> UPSTASH
    AI --> OPENAI

    POSTGRES --> RLS
    POSTGRES --> FUNCTIONS
    POSTGRES --> SUPABASE

    style NEXT fill:#0070f3,color:#fff
    style TRPC fill:#2596be,color:#fff
    style POSTGRES fill:#336791,color:#fff
    style SUPABASE fill:#3ecf8e,color:#fff
```

---

## Detailed Component Architecture

```mermaid
graph LR
    subgraph "Frontend Components"
        PAGES[Pages<br/>App Router]
        COMP[Components<br/>Reusable UI]
        HOOKS[Custom Hooks<br/>Business Logic]
        FORMS[Forms<br/>React Hook Form]
    end

    subgraph "API Routers"
        AUTH_R[auth.router<br/>Authentication]
        EVENTS_R[events.router<br/>Event Management]
        REG_R[registrations.router<br/>Registrations]
        RESUME_R[resumes.router<br/>Resume Management]
        SPONSOR_R[sponsors.router<br/>Sponsor Features]
        COMP_R[competitions.router<br/>Case Competitions]
        MISSION_R[missions.router<br/>Technical Missions]
        MENTOR_R[mentorship.router<br/>Mentorship System]
        ANALYTICS_R[analytics.router<br/>Analytics]
        COMM_R[communications.router<br/>Email System]
    end

    subgraph "Core Services"
        MATCHING[Matching Engine<br/>Mentor Matching]
        POINTS[Points Calculator<br/>Mission Scoring]
        LEADERBOARD[Leaderboard<br/>Ranking System]
        TEMPLATE[Template Engine<br/>Email Templates]
        SCHEDULER[Email Scheduler<br/>Queue Management]
    end

    subgraph "Database Tables"
        USERS[(users)]
        EVENTS[(events)]
        REGS[(event_registrations)]
        WAITLIST[(waitlist)]
        RESUMES[(resume_views)]
        MISSIONS[(missions)]
        SUBMISSIONS[(mission_submissions)]
        MENTORS[(mentorship_profiles)]
        MATCHES[(matches)]
    end

    PAGES --> AUTH_R
    PAGES --> EVENTS_R
    PAGES --> REG_R
    PAGES --> RESUME_R
    PAGES --> SPONSOR_R
    PAGES --> COMP_R
    PAGES --> MISSION_R
    PAGES --> MENTOR_R
    PAGES --> ANALYTICS_R

    COMP --> HOOKS
    FORMS --> HOOKS
    HOOKS --> AUTH_R

    AUTH_R --> USERS
    EVENTS_R --> EVENTS
    REG_R --> REGS
    REG_R --> WAITLIST
    RESUME_R --> RESUMES
    MISSION_R --> MISSIONS
    MISSION_R --> SUBMISSIONS
    MENTOR_R --> MENTORS
    MENTOR_R --> MATCHES

    MENTOR_R --> MATCHING
    MISSION_R --> POINTS
    MISSION_R --> LEADERBOARD
    COMM_R --> TEMPLATE
    COMM_R --> SCHEDULER
```

---

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant tRPC
    participant Database
    participant Services
    participant External

    User->>Frontend: User Action
    Frontend->>tRPC: API Call
    tRPC->>Database: Query/Mutation
    Database-->>tRPC: Data
    tRPC->>Services: Trigger Service
    Services->>External: External API Call
    External-->>Services: Response
    Services-->>tRPC: Service Result
    tRPC-->>Frontend: Response
    Frontend-->>User: UI Update
```

---

## User Role-Based Access Architecture

```mermaid
graph TD
    USER[User Request]
    
    USER --> AUTH{Authentication}
    AUTH -->|Not Authenticated| LOGIN[Login Page]
    AUTH -->|Authenticated| ROLE{Role Check}
    
    ROLE -->|Student| STUDENT[Student Features<br/>- Event Registration<br/>- Resume Upload<br/>- Mission Submissions<br/>- Mentorship Requests]
    
    ROLE -->|Faculty| FACULTY[Faculty Features<br/>- Event Creation<br/>- Session Management<br/>- Analytics]
    
    ROLE -->|Sponsor| SPONSOR[Sponsor Features<br/>- Resume Search<br/>- Shortlist Management<br/>- Mission Creation<br/>- Analytics Dashboard]
    
    ROLE -->|Admin| ADMIN[Admin Features<br/>- Full System Access<br/>- User Management<br/>- Event Management<br/>- Analytics & Reports]
    
    STUDENT --> RLS[Row-Level Security<br/>RLS Policies]
    FACULTY --> RLS
    SPONSOR --> RLS
    ADMIN --> RLS
    
    RLS --> DB[(Database)]
```

---

## Technology Stack Architecture

```mermaid
graph TB
    subgraph "Frontend Stack"
        NEXTJS[Next.js 14<br/>App Router]
        TS[TypeScript<br/>Type Safety]
        TAILWIND[Tailwind CSS<br/>Styling]
        SHADCN[shadcn/ui<br/>Component Library]
        REACT[React 18<br/>UI Framework]
    end

    subgraph "Backend Stack"
        TRPC_STACK[tRPC<br/>Type-Safe API]
        NODE[Node.js<br/>Runtime]
        ZOD[Zod<br/>Validation]
    end

    subgraph "Database Stack"
        POSTGRES_STACK[PostgreSQL<br/>Relational Database]
        SUPABASE_STACK[Supabase<br/>BaaS Platform]
        RLS_STACK[Row-Level Security<br/>Security Layer]
    end

    subgraph "Services Stack"
        RESEND_STACK[Resend<br/>Email Service]
        UPSTASH_STACK[Upstash<br/>Redis Cache]
        OPENAI_STACK[OpenAI/Gemini<br/>AI Services]
        STORAGE_STACK[Supabase Storage<br/>File Storage]
    end

    NEXTJS --> TS
    NEXTJS --> REACT
    NEXTJS --> TAILWIND
    NEXTJS --> SHADCN
    NEXTJS --> TRPC_STACK

    TRPC_STACK --> NODE
    TRPC_STACK --> ZOD
    TRPC_STACK --> POSTGRES_STACK

    POSTGRES_STACK --> SUPABASE_STACK
    POSTGRES_STACK --> RLS_STACK

    TRPC_STACK --> RESEND_STACK
    TRPC_STACK --> UPSTASH_STACK
    TRPC_STACK --> OPENAI_STACK
    TRPC_STACK --> STORAGE_STACK
```

---

## Feature Modules Architecture

```mermaid
graph TB
    subgraph "Core Features"
        EVENTS_MOD[Event Management<br/>- Create/Edit Events<br/>- Event Listing<br/>- Event Details]
        REG_MOD[Registration System<br/>- Event Registration<br/>- Waitlist Management<br/>- QR Check-in]
        RESUME_MOD[Resume Management<br/>- Upload/View<br/>- Sponsor Search<br/>- Analytics]
    end

    subgraph "Advanced Features"
        COMP_MOD[Case Competitions<br/>- Competition Management<br/>- Team Formation<br/>- Judging System]
        MISSION_MOD[Technical Missions<br/>- Mission Creation<br/>- Submission System<br/>- Leaderboard]
        MENTOR_MOD[Mentorship System<br/>- Profile Matching<br/>- Match Management<br/>- Mini Sessions]
    end

    subgraph "Supporting Features"
        ANALYTICS_MOD[Analytics<br/>- Dashboard<br/>- Reports<br/>- Metrics]
        COMM_MOD[Communication<br/>- Email Templates<br/>- Notifications<br/>- Queue System]
        FEEDBACK_MOD[Feedback System<br/>- Event Feedback<br/>- Rating System]
    end

    EVENTS_MOD --> REG_MOD
    REG_MOD --> ANALYTICS_MOD
    RESUME_MOD --> ANALYTICS_MOD
    COMP_MOD --> ANALYTICS_MOD
    MISSION_MOD --> ANALYTICS_MOD
    MENTOR_MOD --> ANALYTICS_MOD
    REG_MOD --> COMM_MOD
    EVENTS_MOD --> FEEDBACK_MOD
```

---

## Database Schema Architecture

```mermaid
erDiagram
    users ||--o{ event_registrations : "registers"
    users ||--o{ resume_views : "views"
    users ||--o{ mission_submissions : "submits"
    users ||--o{ matches : "matched"
    
    events ||--o{ event_registrations : "has"
    events ||--o{ waitlist : "has"
    events ||--o{ event_sessions : "contains"
    events ||--o{ case_competitions : "has"
    
    missions ||--o{ mission_submissions : "receives"
    missions ||--o{ mission_interactions : "tracks"
    
    mentorship_profiles ||--o{ matches : "creates"
    mentorship_profiles ||--o{ match_batches : "generates"
    
    users {
        uuid id PK
        string email
        string role
        jsonb metadata
    }
    
    events {
        uuid id PK
        string title
        integer capacity
        timestamptz starts_at
    }
    
    event_registrations {
        uuid id PK
        uuid event_id FK
        uuid user_id FK
        string status
    }
    
    missions {
        uuid id PK
        string title
        string difficulty
        integer max_points
    }
    
    mission_submissions {
        uuid id PK
        uuid mission_id FK
        uuid user_id FK
        integer score
    }
```

---

## Security Architecture

```mermaid
graph TB
    REQ[Incoming Request]
    
    REQ --> MIDDLEWARE[Next.js Middleware<br/>Route Protection]
    MIDDLEWARE --> AUTH_CHECK{Authentication<br/>Check}
    
    AUTH_CHECK -->|Not Authenticated| REDIRECT[Redirect to Login]
    AUTH_CHECK -->|Authenticated| ROLE_CHECK{Role-Based<br/>Access Control}
    
    ROLE_CHECK -->|Authorized| TRPC_AUTH[tRPC Procedure<br/>Authorization]
    ROLE_CHECK -->|Unauthorized| FORBIDDEN[403 Forbidden]
    
    TRPC_AUTH --> RLS_CHECK[Row-Level Security<br/>Database Policies]
    
    RLS_CHECK -->|Allowed| DB_ACCESS[(Database Access)]
    RLS_CHECK -->|Denied| RLS_ERROR[RLS Policy Error]
    
    DB_ACCESS --> VALIDATION[Data Validation<br/>Zod Schemas]
    VALIDATION --> RESPONSE[Response to Client]
```

---

## Email Communication Architecture

```mermaid
graph LR
    TRIGGER[Event Trigger<br/>Registration/Update]
    
    TRIGGER --> QUEUE_MGR[Queue Manager<br/>Upstash Redis]
    QUEUE_MGR --> TEMPLATE_ENG[Template Engine<br/>Variable Substitution]
    TEMPLATE_ENG --> VARIATION[Variation Selector<br/>A/B Testing]
    VARIATION --> SCHEDULER[Email Scheduler<br/>Batching Logic]
    SCHEDULER --> SURGE[Surge Detector<br/>Rate Limiting]
    SURGE --> RESEND_API[Resend API<br/>Email Delivery]
    RESEND_API --> TRACKING[Email Tracking<br/>Open/Click Analytics]
    TRACKING --> ANALYTICS[Analytics Dashboard]
```

---

## Deployment Architecture

```mermaid
graph TB
    DEV[Development<br/>Local Environment]
    STAGING[Staging<br/>Vercel Preview]
    PROD[Production<br/>Vercel Production]
    
    DEV --> GIT[Git Repository<br/>GitHub]
    STAGING --> GIT
    PROD --> GIT
    
    GIT -->|develop branch| STAGING
    GIT -->|main branch| PROD
    
    STAGING --> SUPABASE_DEV[Supabase<br/>Development DB]
    PROD --> SUPABASE_PROD[Supabase<br/>Production DB]
    
    STAGING --> RESEND_DEV[Resend<br/>Test Domain]
    PROD --> RESEND_PROD[Resend<br/>Production Domain]
    
    STAGING --> UPSTASH_DEV[Upstash<br/>Dev Instance]
    PROD --> UPSTASH_PROD[Upstash<br/>Prod Instance]
```

---

## System Statistics

### **API Endpoints**
- **Total tRPC Routers:** 15
- **Total Endpoints:** 150+
- **Public Endpoints:** ~20
- **Protected Endpoints:** ~130

### **Database**
- **Total Tables:** 30+
- **Database Functions:** 20+
- **RLS Policies:** 50+
- **Indexes:** 40+

### **Frontend**
- **Total Pages:** 50+
- **Components:** 100+
- **Custom Hooks:** 15+

### **Features**
- **Event Management:** ✅ Complete
- **Registration System:** ✅ Complete
- **Resume Management:** ✅ Complete
- **Case Competitions:** ✅ Complete
- **Technical Missions:** ✅ Complete
- **Mentorship System:** ✅ Complete
- **Email System:** ✅ Complete
- **Analytics:** ✅ Complete

---

## Key Architectural Decisions

1. **Type Safety:** tRPC provides end-to-end type safety from database to frontend
2. **Security:** Row-Level Security (RLS) at database level for data protection
3. **Scalability:** Serverless architecture with Vercel for auto-scaling
4. **Performance:** Redis caching for frequently accessed data
5. **Modularity:** Feature-based router organization for maintainability
6. **Real-time:** React Query for efficient data fetching and caching

---

## Presentation Notes

### **For Your Presentation:**

1. **Start with High-Level Architecture** - Show the overall system flow
2. **Explain Technology Stack** - Why Next.js, tRPC, Supabase
3. **Highlight Security** - RLS policies, role-based access
4. **Show Feature Modules** - What each module does
5. **Demonstrate Scalability** - Serverless, caching, queue system
6. **End with Statistics** - Show the scale of the system

### **Key Points to Emphasize:**

- ✅ **Type-Safe API** - tRPC ensures type safety across the stack
- ✅ **Secure by Default** - RLS policies protect data at database level
- ✅ **Scalable Architecture** - Serverless deployment with auto-scaling
- ✅ **Feature Complete** - All major features implemented
- ✅ **Modern Stack** - Latest technologies and best practices

---

**Generated for:** CMIS Event Management System Presentation  
**Date:** December 2024  
**Version:** 1.0

