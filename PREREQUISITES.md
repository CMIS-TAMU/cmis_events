# Prerequisites Checklist - CMIS Event Management System

Complete checklist of everything you need before starting development.

## ✅ Software Prerequisites

### Required (Must Install)

- [ ] **Node.js v20+**
  - Download: https://nodejs.org/
  - Verify: `node --version`
  - Minimum: v20.0.0
  - Recommended: Latest LTS version

- [ ] **pnpm Package Manager**
  - Install: `npm install -g pnpm`
  - Verify: `pnpm --version`
  - Minimum: v8.0.0

- [ ] **Git**
  - Download: https://git-scm.com/downloads
  - Verify: `git --version`
  - Configure: Set your name and email

- [ ] **VS Code (Recommended Editor)**
  - Download: https://code.visualstudio.com/
  - Required Extensions:
    - [ ] ESLint
    - [ ] Prettier
    - [ ] Tailwind CSS IntelliSense
    - [ ] GitLens
    - [ ] Error Lens

### Optional (But Helpful)

- [ ] **PostgreSQL Client**
  - pgAdmin: https://www.pgadmin.org/download/
  - Or use Supabase's built-in SQL editor

- [ ] **GitHub CLI**
  - Install: `brew install gh` (Mac) or see https://cli.github.com/
  - Useful for managing GitHub from terminal

## 🌐 Service Accounts

Create accounts for these services (all have free tiers):

### Core Services (Required)

- [ ] **GitHub Account**
  - Sign up: https://github.com/signup
  - Organization: `CMIS-TAMU` (already created)
  - Repository: `cmis-event-management-system` (already created at https://github.com/CMIS-TAMU/cmis-event-management-system)

- [ ] **Vercel Account**
  - Sign up: https://vercel.com/signup
  - Connect with GitHub
  - Purpose: Frontend hosting

- [ ] **Supabase Account**
  - Sign up: https://supabase.com/dashboard/sign-up
  - Create project: `cmis-production`
  - Purpose: Database, Auth, Storage

- [ ] **Railway Account**
  - Sign up: https://railway.app/
  - Purpose: Host N8N automation

### Supporting Services (Required)

- [ ] **Resend Account**
  - Sign up: https://resend.com/signup
  - Purpose: Email service
  - Free: 100 emails/day

- [ ] **Upstash Redis**
  - Sign up: https://console.upstash.com/
  - Purpose: Caching
  - Free: 10k commands/day

- [ ] **Cloudinary**
  - Sign up: https://cloudinary.com/users/register/free
  - Purpose: Image storage
  - Free: 25GB storage

- [ ] **Sentry**
  - Sign up: https://sentry.io/signup/
  - Purpose: Error tracking
  - Free: 5k errors/month

### AI Service (Choose One)

- [ ] **OpenAI**
  - Sign up: https://platform.openai.com/signup
  - Get API key
  - Free tier: $5 credit

- [ ] OR **Google AI (Gemini)**
  - Get API key: https://aistudio.google.com/app/apikey
  - Free tier: 60 requests/minute

### Optional Services

- [ ] **GitHub Student Developer Pack**
  - Apply: https://education.github.com/pack
  - Provides additional credits and free tiers

## 📋 System Requirements

### Minimum
- [ ] OS: macOS 10.15+, Windows 10+, or Ubuntu 20.04+
- [ ] RAM: 8GB
- [ ] Storage: 10GB free space
- [ ] Internet: Stable connection

### Recommended
- [ ] RAM: 16GB+
- [ ] CPU: Multi-core (4+ cores)
- [ ] Storage: SSD with 20GB+ free
- [ ] Internet: High-speed connection

## 🔑 API Keys Checklist

Once you have accounts, collect these API keys:

### Supabase
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `DATABASE_URL`

### Vercel
- [ ] Already connected via GitHub (no key needed)

### N8N
- [ ] `NEXT_PUBLIC_N8N_WEBHOOK_URL`
- [ ] `N8N_WEBHOOK_SECRET` (generate yourself)

### Redis
- [ ] `UPSTASH_REDIS_REST_URL`
- [ ] `UPSTASH_REDIS_REST_TOKEN`

### Email
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_FROM_EMAIL`

### AI
- [ ] `OPENAI_API_KEY` OR
- [ ] `GOOGLE_AI_API_KEY`

### Cloudinary
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`

### Sentry
- [ ] `SENTRY_DSN`
- [ ] `SENTRY_AUTH_TOKEN`

## 🧪 Verification Commands

Run these to verify your setup:

```bash
# Check Node.js
node --version
# Should output: v20.x.x or higher

# Check pnpm
pnpm --version
# Should output: 8.x.x or higher

# Check Git
git --version
# Should output: git version 2.x.x or higher

# Check npm (comes with Node.js)
npm --version
# Should output: 10.x.x or higher

# Verify pnpm works
pnpm --help
# Should show pnpm help menu
```

## 📝 Pre-Setup Checklist

Before starting development:

- [ ] All software installed and verified
- [ ] All service accounts created
- [ ] API keys collected and saved securely
- [ ] GitHub repository created
- [ ] Team members have access to repository
- [ ] VS Code installed with required extensions
- [ ] Read the [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## 🚀 Ready to Start?

Once all prerequisites are met:

1. ✅ Follow [QUICK_START.md](./QUICK_START.md) for fast setup
2. ✅ Follow [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup
3. ✅ Review [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) for project timeline

---

**All prerequisites met? Great! Let's build! 🎉**

