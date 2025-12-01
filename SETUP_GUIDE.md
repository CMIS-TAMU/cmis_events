# CMIS Event Management System - Complete Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Account Setup](#account-setup)
4. [Development Environment Setup](#development-environment-setup)
5. [Project Initialization](#project-initialization)
6. [Service Configuration](#service-configuration)
7. [Database Setup](#database-setup)
8. [Verification & Testing](#verification--testing)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Knowledge
- Basic understanding of JavaScript/TypeScript
- Familiarity with React/Next.js (helpful but not required)
- Git version control basics
- Command line/terminal usage

### Software Prerequisites

Before starting, ensure you have the following installed:

#### 1. **Node.js (v20 LTS or higher)**
- **Download:** https://nodejs.org/
- **Verify installation:**
  ```bash
  node --version  # Should show v20.x.x or higher
  npm --version   # Should show 10.x.x or higher
  ```

#### 2. **Package Manager: pnpm**
- **Installation:**
  ```bash
  npm install -g pnpm
  ```
- **Verify:**
  ```bash
  pnpm --version  # Should show 8.x.x or higher
  ```

#### 3. **Git**
- **Download:** https://git-scm.com/downloads
- **Verify installation:**
  ```bash
  git --version
  ```
- **Configure Git (if not done):**
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```

#### 4. **Code Editor: VS Code (Recommended)**
- **Download:** https://code.visualstudio.com/
- **Recommended Extensions:**
  - ESLint
  - Prettier - Code formatter
  - Tailwind CSS IntelliSense
  - GitLens
  - Error Lens
  - TypeScript Vue Plugin (Volar) (if using Vue)

#### 5. **PostgreSQL Client (Optional, for direct DB access)**
- **pgAdmin:** https://www.pgadmin.org/download/
- Or use Supabase's built-in SQL editor

---

## System Requirements

### Minimum Requirements
- **OS:** macOS 10.15+, Windows 10+, or Linux (Ubuntu 20.04+)
- **RAM:** 8GB (16GB recommended)
- **Storage:** 10GB free space
- **Internet:** Stable connection for package downloads and API access

### Recommended
- **RAM:** 16GB+
- **CPU:** Multi-core processor (4+ cores)
- **Storage:** SSD with 20GB+ free space

---

## Account Setup

You'll need accounts for the following services (all offer free tiers):

### 1. GitHub Account
- **Sign up:** https://github.com/signup
- **Benefits:** Repository hosting, CI/CD, project management
- **Free tier:** Unlimited public/private repos

### 2. Vercel Account (Frontend Hosting)
- **Sign up:** https://vercel.com/signup
- **Connect:** Use GitHub to sign in
- **Free tier:** Unlimited projects, 100GB bandwidth/month

### 3. Supabase Account (Database + Auth + Storage)
- **Sign up:** https://supabase.com/dashboard/sign-up
- **Free tier:** 
  - 500MB database
  - 1GB file storage
  - 50,000 monthly active users
  - 2GB bandwidth

### 4. Railway Account (N8N Hosting)
- **Sign up:** https://railway.app/
- **Free tier:** $5 credit/month (usually enough for N8N)

### 5. Resend Account (Email Service)
- **Sign up:** https://resend.com/signup
- **Free tier:** 100 emails/day, 3,000 emails/month

### 6. Upstash Redis
- **Sign up:** https://console.upstash.com/
- **Free tier:** 10,000 commands/day

### 7. Cloudinary (Image Storage)
- **Sign up:** https://cloudinary.com/users/register/free
- **Free tier:** 25GB storage, 25GB bandwidth/month

### 8. Sentry (Error Tracking)
- **Sign up:** https://sentry.io/signup/
- **Free tier:** 5,000 errors/month

### 9. AI Service (Choose one)
- **OpenAI:** https://platform.openai.com/signup
  - Free tier: $5 credit (limited time)
  - Pay-as-you-go after
- **Google AI (Gemini):** https://aistudio.google.com/app/apikey
  - Free tier: 60 requests/minute

### 10. GitHub Student Developer Pack (Optional but Recommended)
- **Apply:** https://education.github.com/pack
- **Benefits:** Additional credits and free tiers for students

---

## Development Environment Setup

### Step 1: Clone the Repository

```bash
# Navigate to your projects directory
cd ~/Documents/Projects

# Clone the repository
git clone https://github.com/CMIS-TAMU/cmis-event-management-system.git
cd cmis-event-management-system
```

> **Note:** If repository doesn't exist yet, we'll create it in the next section.

### Step 2: Install VS Code Extensions

Open VS Code and install these extensions:

1. Open Command Palette: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Extensions: Install Extensions"
3. Search and install:
   - `dbaeumer.vscode-eslint` (ESLint)
   - `esbenp.prettier-vscode` (Prettier)
   - `bradlc.vscode-tailwindcss` (Tailwind CSS IntelliSense)
   - `eamodio.gitlens` (GitLens)
   - `usernamehw.errorlens` (Error Lens)

### Step 3: Verify Installation

Run these commands to verify everything is installed:

```bash
# Check Node.js
node --version

# Check npm
npm --version

# Check pnpm
pnpm --version

# Check Git
git --version

# Check pnpm is working
pnpm --version
```

---

## Project Initialization

### Step 1: Create Next.js Project

```bash
# If repository doesn't exist, initialize it first
git init
git remote add origin https://github.com/CMIS-TAMU/cmis-event-management-system.git

# Create Next.js project with TypeScript and Tailwind
npx create-next-app@latest . --typescript --tailwind --app --use-pnpm --no-src-dir

# This will prompt you with options:
# - Would you like to use `src/` directory? → No
# - Would you like to use App Router? → Yes
# - Would you like to customize the default import alias? → No
```

### Step 2: Install Core Dependencies

```bash
# Install backend dependencies
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
pnpm add @trpc/server @trpc/client @trpc/react-query @trpc/next
pnpm add @tanstack/react-query
pnpm add zod
pnpm add zustand
pnpm add react-hook-form @hookform/resolvers
pnpm add date-fns
pnpm add qrcode react-qr-code
pnpm add @upstash/redis
pnpm add resend
pnpm add @sentry/nextjs

# Install UI dependencies
pnpm add lucide-react clsx tailwind-merge
pnpm add @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-dropdown-menu

# Install utility libraries
pnpm add bcryptjs jsonwebtoken
pnpm add axios
pnpm add react-pdf pdf-parse

# Install dev dependencies
pnpm add -D @types/node @types/bcryptjs @types/jsonwebtoken
pnpm add -D @types/react @types/react-dom
pnpm add -D eslint-config-next prettier
pnpm add -D typescript
```

### Step 3: Set Up shadcn/ui Components

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Answer prompts:
# - Would you like to use TypeScript? → Yes
# - Which style would you like to use? → Default
# - Which color would you like to use as base color? → Slate
# - Where is your global CSS file? → app/globals.css
# - Would you like to use CSS variables for colors? → Yes
# - Where is your tailwind.config.js located? → tailwind.config.ts
# - Configure the import alias for components? → @/components
# - Configure the import alias for utils? → @/lib/utils

# Install commonly used components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add calendar
```

### Step 4: Configure TypeScript

Create or update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Step 5: Set Up ESLint and Prettier

Create `.eslintrc.json`:

```json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

Create `.prettierignore`:

```
node_modules
.next
.vercel
dist
build
```

---

## Service Configuration

### Step 1: Create Environment Variables File

Create `.env.local` in the root directory:

```bash
# Copy the template
cp .env.example .env.local
```

> **Note:** We'll create `.env.example` in the next step.

### Step 2: Set Up Supabase

1. **Create a new project:**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Name: `cmis-production`
   - Database Password: (generate a strong password, save it!)
   - Region: Choose closest to you
   - Click "Create new project"

2. **Get API Keys:**
   - Go to Project Settings → API
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

3. **Enable Auth Providers:**
   - Go to Authentication → Providers
   - Enable "Email"
   - Configure email templates
   - (Optional) Set up TAMU SSO (SAML) - requires IT coordination

4. **Set up Storage Buckets:**
   - Go to Storage
   - Create bucket: `resumes` (Private)
   - Create bucket: `event-images` (Public)
   - Set file size limits:
     - Resumes: 10 MB max
     - Event images: 5 MB max

### Step 3: Set Up Vercel

1. **Connect Repository:**
   - Go to https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Next.js
     - Root Directory: `./`
     - Build Command: `pnpm build`
     - Output Directory: `.next`

2. **Add Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`
   - Set them for Production, Preview, and Development

### Step 4: Set Up Resend (Email)

1. **Create API Key:**
   - Go to https://resend.com/api-keys
   - Click "Create API Key"
   - Name: `cmis-production`
   - Copy the key → `RESEND_API_KEY`

2. **Verify Domain (Optional, for production):**
   - Add your domain in Resend dashboard
   - Add DNS records as instructed

### Step 5: Set Up Upstash Redis

1. **Create Database:**
   - Go to https://console.upstash.com/
   - Click "Create Database"
   - Name: `cmis-redis`
   - Region: Choose closest
   - Type: Regional

2. **Get Credentials:**
   - Go to database details
   - Copy `UPSTASH_REDIS_REST_URL`
   - Copy `UPSTASH_REDIS_REST_TOKEN`

### Step 6: Set Up Cloudinary

1. **Get API Credentials:**
   - Go to https://console.cloudinary.com/console
   - Copy:
     - Cloud name → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
     - API Key → `CLOUDINARY_API_KEY`
     - API Secret → `CLOUDINARY_API_SECRET`

### Step 7: Set Up Sentry

1. **Create Project:**
   - Go to https://sentry.io/
   - Create new project
   - Choose "Next.js"
   - Follow installation wizard

2. **Install Sentry:**
   ```bash
   pnpm add @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

### Step 8: Set Up N8N on Railway

1. **Deploy N8N:**
   - Go to https://railway.app/
   - Click "New Project"
   - Click "Deploy from GitHub" or "Deploy from Template"
   - Search for "N8N"
   - Deploy the official N8N template

2. **Configure Environment Variables:**
   - Add:
     - `N8N_BASIC_AUTH_ACTIVE=true`
     - `N8N_BASIC_AUTH_USER=admin` (change this!)
     - `N8N_BASIC_AUTH_PASSWORD=<strong-password>` (change this!)

3. **Get Webhook URL:**
   - Once deployed, N8N will be available at a Railway URL
   - Note the URL → `NEXT_PUBLIC_N8N_WEBHOOK_URL`

---

## Environment Variables Template

Create `.env.example` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database
DATABASE_URL=your_supabase_database_url

# N8N Automation
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.railway.app
N8N_WEBHOOK_SECRET=generate_random_string_here

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# AI Services (Choose one)
OPENAI_API_KEY=your_openai_api_key
# OR
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Cloudinary (Images)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Sentry (Error Tracking)
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Security
JWT_SECRET=generate_random_string_here
ENCRYPTION_KEY=generate_random_string_here_32_chars

# QR Code
QR_CODE_SECRET=generate_random_string_here
```

**Important:** Copy this to `.env.local` and fill in your actual values. **Never commit `.env.local` to Git!**

---

## Database Setup

### Step 1: Run Database Schema

1. **Open Supabase SQL Editor:**
   - Go to your Supabase project
   - Click "SQL Editor" in the left sidebar

2. **Create Tables:**
   - Copy the SQL schema (see `database/schema.sql` in project)
   - Paste into SQL Editor
   - Click "Run"

### Step 2: Set Up Row-Level Security (RLS)

Enable RLS on all tables:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies (see database/policies.sql for full policies)
```

### Step 3: Set Up Database Functions

Create helper functions for:
- User registration
- Event capacity checking
- Waitlist management
- Analytics aggregation

(These will be in `database/functions.sql`)

### Step 4: Set Up Supabase Webhooks

1. **Go to Database → Webhooks**
2. **Create Webhooks for:**
   - New event registration → N8N webhook
   - Event cancellation → N8N webhook
   - Waitlist spot opening → N8N webhook

---

## Project Structure

After setup, your project should look like:

```
cmis-event-management-system/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   └── features/         # Feature-specific components
├── lib/                  # Utility functions
│   ├── supabase/         # Supabase clients
│   ├── trpc/             # tRPC setup
│   └── utils/            # Helper functions
├── server/               # Server-side code
│   ├── routers/          # tRPC routers
│   ├── middleware/       # Middleware functions
│   └── utils/            # Server utilities
├── public/               # Static assets
├── database/             # Database scripts
│   ├── schema.sql        # Database schema
│   ├── policies.sql      # RLS policies
│   └── functions.sql     # Database functions
├── n8n/                  # N8N workflows (JSON)
├── .env.local           # Environment variables (not in git)
├── .env.example         # Environment template
├── next.config.js       # Next.js config
├── tailwind.config.ts   # Tailwind config
├── tsconfig.json        # TypeScript config
└── package.json         # Dependencies
```

---

## Verification & Testing

### Step 1: Start Development Server

```bash
# Install dependencies (if not done)
pnpm install

# Start development server
pnpm dev
```

Visit http://localhost:3000 - you should see the Next.js welcome page.

### Step 2: Test Database Connection

Create a test file `lib/test-db.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function testConnection() {
  const { data, error } = await supabase.from('users').select('count')
  console.log('Database connection:', error ? 'FAILED' : 'SUCCESS')
  return { data, error }
}
```

Run it in a test route or component.

### Step 3: Test API Routes

```bash
# Test if API is running
curl http://localhost:3000/api/health
```

### Step 4: Verify All Services

Create a checklist:

- [ ] Supabase connection works
- [ ] Vercel deployment works
- [ ] Environment variables are set
- [ ] Database tables exist
- [ ] Storage buckets created
- [ ] N8N webhook responds
- [ ] Email service (Resend) configured
- [ ] Redis connection works

---

## Troubleshooting

### Common Issues

#### 1. **pnpm command not found**
```bash
npm install -g pnpm
```

#### 2. **Port 3000 already in use**
```bash
# Kill process on port 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
pnpm dev -- -p 3001
```

#### 3. **Supabase connection errors**
- Verify environment variables are set correctly
- Check that Supabase project is active
- Verify API keys in Supabase dashboard

#### 4. **Module not found errors**
```bash
# Delete node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 5. **TypeScript errors**
```bash
# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

#### 6. **Database migration errors**
- Check SQL syntax in Supabase SQL Editor
- Verify table names match exactly
- Check for foreign key constraints

#### 7. **N8N webhook not working**
- Verify N8N instance is running
- Check webhook URL is correct
- Test webhook with curl:
  ```bash
  curl -X POST https://your-n8n-url.railway.app/webhook/test
  ```

---

## Next Steps

After completing the setup:

1. ✅ Read the [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)
2. ✅ Review [Phase 0 tasks](./DEVELOPMENT_ROADMAP.md#phase-0-project-setup--planning-week-1)
3. ✅ Set up your first tRPC router
4. ✅ Create your first component
5. ✅ Start Sprint 1 development

---

## Getting Help

- **Documentation:**
  - Next.js: https://nextjs.org/docs
  - Supabase: https://supabase.com/docs
  - tRPC: https://trpc.io/docs
  - shadcn/ui: https://ui.shadcn.com/

- **Community:**
  - GitHub Discussions
  - Team Slack/Discord

- **Support:**
  - Check troubleshooting section above
  - Search existing GitHub issues
  - Create new issue with detailed error message

---

## Quick Start Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check
```

---

**Setup completed? Great! Now you're ready to start building. 🚀**

