# CMIS Event Management System

A comprehensive event management platform for the Center for Management Information Systems (CMIS) at Texas A&M University, built with Next.js, TypeScript, Supabase, and modern web technologies.

## 🔗 Repository

**GitHub:** [https://github.com/CMIS-TAMU/cmis_events](https://github.com/CMIS-TAMU/cmis_events)

Organization: `CMIS-TAMU`  
Repository: `cmis_events`

## 🎯 Project Overview

The CMIS Event Management System streamlines event registration, attendance tracking, resume management, and sponsor-student interactions for CMIS events. It features AI-powered chatbots, automated workflows, and comprehensive analytics.

**Key Features:**
- ✅ Multi-role user management (Students, Faculty, Sponsors, Admins)
- ✅ Event creation and management
- ✅ Online registration with waitlist
- ✅ QR code check-in system
- ✅ Resume upload and sponsor search
- ✅ Case competition management
- ✅ AI chatbot for event support
- ✅ Automated email workflows
- ✅ Real-time analytics dashboard

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
- Node.js 20+ installed
- pnpm package manager
- Git installed
- Accounts for required services (see [Setup Guide](./SETUP_GUIDE.md))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/CMIS-TAMU/cmis_events.git
   cd cmis_events
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your service credentials
   ```

4. **Run the development server:**
   ```bash
   pnpm dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

For detailed setup instructions, see the [Complete Setup Guide](./SETUP_GUIDE.md).

## 🔗 Repository

**GitHub:** [https://github.com/CMIS-TAMU/cmis_events](https://github.com/CMIS-TAMU/cmis_events)

- **Organization:** CMIS-TAMU
- **Repository:** cmis_events

## 📚 Documentation

**👉 Start here: [INDEX.md](./INDEX.md) - Complete documentation index**

### Getting Started
- **[INDEX.md](./INDEX.md)** - Documentation index and reading guide
- **[PREREQUISITES.md](./PREREQUISITES.md)** - What you need before starting
- **[QUICK_START.md](./QUICK_START.md)** - Get running in 15 minutes
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete installation and configuration guide
- **[BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md)** - Step-by-step build process

### Project Planning
- **[DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)** - Full project timeline and milestones

### Configuration
- **[ENV_TEMPLATE.md](./ENV_TEMPLATE.md)** - Environment variables template
- **[GIT_SETUP.md](./GIT_SETUP.md)** - Git repository setup and workflow

### Additional Docs (Coming Soon)
- **[API Documentation](./docs/API.md)** - API endpoints and usage
- **[Database Schema](./docs/DATABASE.md)** - Database structure and relationships
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to the project

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **API Client:** tRPC

### Backend
- **Runtime:** Node.js
- **API:** tRPC
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage + Cloudinary
- **Caching:** Upstash Redis

### Infrastructure
- **Hosting:** Vercel
- **Database:** Supabase
- **Automation:** N8N (Railway)
- **Email:** Resend
- **Error Tracking:** Sentry
- **AI Services:** OpenAI / Google Gemini

## 📁 Project Structure

```
cmis_events/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── features/         # Feature-specific components
│   └── forms/            # Form components
├── lib/                  # Utilities and configurations
│   ├── supabase/         # Supabase client setup
│   ├── trpc/             # tRPC configuration
│   └── utils/            # Helper functions
├── server/               # Server-side code
│   ├── routers/          # tRPC routers
│   └── middleware/       # Auth & validation middleware
├── database/             # Database scripts
│   ├── schema.sql        # Database schema
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

## 🧪 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript type checking
pnpm format           # Format code with Prettier
```

### Code Quality

- **Linting:** ESLint with Next.js config
- **Formatting:** Prettier
- **Type Safety:** TypeScript strict mode
- **Code Review:** Required for all PRs

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `RESEND_API_KEY` - Resend email API key
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL
- `OPENAI_API_KEY` or `GOOGLE_AI_API_KEY` - AI service API key

See [Setup Guide](./SETUP_GUIDE.md) for complete list and setup instructions.

## 👥 User Roles

- **Student:** Register for events, upload resume, view registrations
- **Faculty:** Create events, manage sessions, view analytics
- **Sponsor:** Browse student resumes, view event attendance
- **Admin:** Full system access, user management, reporting

## 🚢 Deployment

### Environments

- **Development:** Local (`localhost:3000`)
- **Staging:** Vercel Preview (auto-deploy from `develop` branch)
- **Production:** Vercel Production (deploy from `main` branch)

### Deployment Process

1. Push to `develop` branch → Auto-deploys to staging
2. Test on staging environment
3. Create PR to `main` branch
4. Code review and approval
5. Merge to `main` → Auto-deploys to production

## 📊 Project Status

- ✅ **Phase 0:** Project Setup (Week 1)
- 🔄 **Phase 1:** Core Features MVP (Weeks 2-3)
- ⏳ **Phase 2:** Enhanced Features (Weeks 4-5)
- ⏳ **Phase 3:** AI Features (Weeks 6-7)
- ⏳ **Phase 4:** Advanced Features (Weeks 8-9)
- ⏳ **Phase 5:** Polish & Launch (Week 10)

See [Development Roadmap](./DEVELOPMENT_ROADMAP.md) for detailed timeline.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for:
- Code style guidelines
- Pull request process
- Issue reporting
- Development workflow

## 📝 License

This project is proprietary software for Texas A&M University CMIS.

## 📞 Support

For questions or issues:
- Open a GitHub issue
- Contact the development team
- Check documentation in `/docs`

## 🙏 Acknowledgments

- Built for the Center for Management Information Systems (CMIS)
- Texas A&M University
- Thanks to all contributors and the open-source community

---

**Built with ❤️ by the CMIS Development Team**

