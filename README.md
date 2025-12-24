# CMIS Events

> Enterprise event management, powered by AI

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![AI](https://img.shields.io/badge/AI-Powered-6366f1?style=flat-square)](https://openai.com)

A full-stack event platform for Texas A&M's Council for the Management of Information Systems—featuring intelligent resume matching, automated mentorship, and real-time analytics.

```bash
pnpm install && pnpm dev
```

---

## What's Inside

**For Students**  
One-click event registration • Resume uploads • AI mentorship matching • QR check-ins

**For Sponsors**  
Semantic resume search • Candidate shortlisting • Tiered access control • Analytics dashboard

**For Faculty**  
Event creation • Capacity management • Attendance tracking • Real-time reporting

**For Admins**  
Full system control • User management • System configuration • Comprehensive insights

---

## Quick Start

```bash
# Clone & Install
git clone https://github.com/CMIS-TAMU/cmis_events.git
cd cmis_events
pnpm install

# Configure
cp .env.example .env.local
# Add your Supabase, Resend, and AI API keys

# Run migrations
# Execute SQL files in database/migrations/ via Supabase SQL Editor

# Launch
pnpm dev
```

Open [localhost:3000](http://localhost:3000)

> **Note**: Requires Node.js 20+, pnpm, and a Supabase project

---

## AI Features

**Vector Search**  
pgvector + OpenAI embeddings for semantic resume-to-job matching

**Smart Matching**  
Automated mentor recommendations based on skills & interests

**Intelligent Chat**  
Natural language event assistant with context-aware responses

**Predictive Analytics**  
ML-driven insights for event planning and user engagement

---

## Tech Stack

**Frontend**  
Next.js 16 (App Router) • TypeScript • Tailwind CSS • shadcn/ui • Zustand

**Backend**  
tRPC • PostgreSQL • Supabase • pgvector • Upstash Redis

**AI/ML**  
OpenAI API • Google Gemini • Vector embeddings • Semantic search

**Infrastructure**  
Netlify • Supabase • Resend • Sentry

---

## Structure

```
app/
├── (auth)/              → Login, signup, password reset
├── (dashboard)/         → Role-based dashboards
│   ├── admin/          → System management
│   ├── student/        → Event registration & profile
│   ├── sponsor/        → Resume search & analytics
│   └── faculty/        → Event creation & tracking
└── api/
    ├── embeddings/     → Vector search endpoints
    └── cron/           → Scheduled jobs

components/
├── ui/                 → Reusable UI components
└── features/           → Feature-specific modules

lib/
├── ai/                 → AI services & embeddings
├── services/           → Business logic
└── communications/     → Email & notifications

server/
└── routers/            → tRPC API routes
```

---

## Key Capabilities

**Authentication**  
Multi-role signup • Email verification • Password recovery • Session management

**Event Management**  
Multi-session support • Waitlist automation • QR code generation • Real-time tracking

**Resume Pipeline**  
PDF storage • Version control • AI-powered matching • Bulk export • Analytics

**Mentorship Engine**  
Automated matching • Request tracking • Communication tools • Success metrics

**Sponsor Portal**  
Tiered access (Basic/Standard/Premium) • Advanced search • Engagement analytics

---

## Development

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm type-check   # TypeScript validation
```

**Branch Strategy**  
`main` → Production | `develop` → Integration | `feature/*` → New work

**Code Standards**  
TypeScript strict mode • ESLint 9 flat config • Prettier • Conventional commits

---

## Deployment

**Production**: Auto-deploy from `main` → Netlify  
**Live Site**: [https://cmis-tamu.netlify.app](https://cmis-tamu.netlify.app)

**Required Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=         # Service role key
RESEND_API_KEY=                    # Email service
OPENAI_API_KEY=                    # AI embeddings (or use Google AI)
UPSTASH_REDIS_REST_URL=            # Caching layer
```

---

## Documentation

**Setup & Configuration**  
[SETUP_GUIDE.md](./SETUP_GUIDE.md) • [VECTOR_EMBEDDINGS_GUIDE.md](./VECTOR_EMBEDDINGS_GUIDE.md)

**Features & Roadmap**  
[COMPLETE_FEATURES_DOCUMENTATION.md](./COMPLETE_FEATURES_DOCUMENTATION.md) • [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)

**Architecture & Demos**  
[ARCHITECTURE_QUICK_REFERENCE.md](./ARCHITECTURE_QUICK_REFERENCE.md) • [DEMO_QUICK_REFERENCE.md](./DEMO_QUICK_REFERENCE.md)

**Technical Debt**  
[TECH_DEBT.md](./TECH_DEBT.md)

---

## Contributing

We welcome contributions! Here's how:

1. Fork the repo
2. Create a feature branch from `develop`
3. Make your changes (follow ESLint + TypeScript strict)
4. Test thoroughly
5. Submit a PR with clear description

**Need help?** Open an issue or check existing documentation.

---

## Status

**Version**: 0.1.0  
**Status**: Production Ready  
**Updated**: December 2025

**Completed**: Authentication • Events • Registration • Resumes • Vector Search • AI Matching • Mentorship • Sponsor Portal • Chatbot • Analytics

**In Progress**: Performance optimization • Enhanced AI features • Advanced analytics

---

## License

Proprietary © 2025 CMIS-TAMU

---

## Links

**Repository**: [github.com/CMIS-TAMU/cmis_events](https://github.com/CMIS-TAMU/cmis_events)  
**Organization**: [github.com/CMIS-TAMU](https://github.com/CMIS-TAMU)  
**Production**: [cmis-tamu.netlify.app](https://cmis-tamu.netlify.app)

---

<div align="center">

**Built by the CMIS Development Team**

[Report Bug](https://github.com/CMIS-TAMU/cmis_events/issues) • [Request Feature](https://github.com/CMIS-TAMU/cmis_events/issues) • [Documentation](./SETUP_GUIDE.md)

</div>
