# 🏗️ CMIS System Architecture - Quick Reference

## System Overview (One Slide)

```
┌─────────────────────────────────────────────────────────────┐
│                    CMIS Event Management System              │
│                                                               │
│  Frontend (Next.js 14) → tRPC API → PostgreSQL (Supabase)   │
│                                                               │
│  Features: Events | Registrations | Resumes | Missions      │
│            Competitions | Mentorship | Analytics | Email     │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack (One Slide)

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- React Query + Zustand

**Backend:**
- tRPC (Type-safe API)
- Node.js
- Supabase (Database + Auth + Storage)

**Services:**
- Resend (Email)
- Upstash (Redis Cache)
- OpenAI/Gemini (AI Chat)

## Architecture Layers

```
┌─────────────────────────────────────┐
│   Presentation Layer                │
│   (Next.js Pages & Components)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   API Layer                        │
│   (tRPC Routers - 15 routers)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Business Logic Layer              │
│   (Services, Matching, Calculations) │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Data Layer                        │
│   (PostgreSQL + RLS Policies)      │
└─────────────────────────────────────┘
```

## Key Statistics

- **15 tRPC Routers** with **150+ endpoints**
- **30+ Database Tables** with **50+ RLS Policies**
- **50+ Pages** and **100+ Components**
- **8 Major Feature Modules** fully implemented

## Security Architecture

```
User Request
    ↓
Authentication (Supabase Auth)
    ↓
Role-Based Access Control
    ↓
tRPC Procedure Authorization
    ↓
Row-Level Security (Database)
    ↓
Data Access
```

## Data Flow

```
User Action → Frontend → tRPC API → Database
                                    ↓
                              External Services
                                    ↓
                              Response → Frontend → UI Update
```

## Feature Modules

1. **Event Management** - Create, manage, and track events
2. **Registration System** - Event registration with waitlist
3. **Resume Management** - Upload, search, and analytics
4. **Case Competitions** - Competition management and judging
5. **Technical Missions** - Coding challenges with leaderboard
6. **Mentorship System** - AI-powered mentor matching
7. **Email System** - Automated notifications and templates
8. **Analytics** - Comprehensive dashboards and reports

## Deployment

- **Development:** Local (localhost:3000)
- **Staging:** Vercel Preview (auto-deploy from `develop`)
- **Production:** Vercel Production (auto-deploy from `main`)

## Key Architectural Highlights

✅ **Type-Safe:** End-to-end type safety with tRPC  
✅ **Secure:** Row-Level Security at database level  
✅ **Scalable:** Serverless architecture with auto-scaling  
✅ **Modern:** Latest technologies and best practices  
✅ **Complete:** All features implemented and tested

