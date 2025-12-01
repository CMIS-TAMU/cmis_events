# Build Instructions - CMIS Event Management System

Step-by-step instructions to build and run the application from scratch.

## 🎯 Overview

This document provides complete instructions for:
1. Setting up the development environment
2. Installing all dependencies
3. Configuring all services
4. Building and running the application
5. Deploying to production

## 📚 Documentation Index

1. **[PREREQUISITES.md](./PREREQUISITES.md)** - Check what you need first
2. **[QUICK_START.md](./QUICK_START.md)** - Get running in 15 minutes
3. **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete detailed setup
4. **[DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)** - Project timeline

## 🚀 Quick Build (15 Minutes)

For the fastest path to a running application:

```bash
# 1. Clone or create project
cd ~/Documents/Projects
git clone https://github.com/CMIS-TAMU/cmis-event-management-system.git && cd cmis-event-management-system

# 2. Initialize Next.js
npx create-next-app@latest . --typescript --tailwind --app --use-pnpm

# 3. Install dependencies
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
pnpm add @trpc/server @trpc/client @trpc/react-query @trpc/next
pnpm add @tanstack/react-query zod zustand
pnpm add react-hook-form @hookform/resolvers date-fns

# 4. Set up environment variables
# Copy .env.example to .env.local and fill in values

# 5. Run the application
pnpm dev
```

Visit http://localhost:3000

See [QUICK_START.md](./QUICK_START.md) for detailed quick start.

## 🔨 Complete Build Process

### Step 1: Prerequisites

Verify all prerequisites are met:

```bash
# Check Node.js (v20+)
node --version

# Check pnpm
pnpm --version

# Check Git
git --version
```

See [PREREQUISITES.md](./PREREQUISITES.md) for complete checklist.

### Step 2: Project Initialization

```bash
# Navigate to project directory
cd ~/Documents/Projects
# Clone the repository
git clone https://github.com/CMIS-TAMU/cmis-event-management-system.git
cd cmis-event-management-system

# Initialize Next.js with TypeScript and Tailwind
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --use-pnpm \
  --no-src-dir \
  --import-alias "@/*"
```

### Step 3: Install Dependencies

#### Core Backend Dependencies

```bash
# Supabase
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react

# tRPC
pnpm add @trpc/server @trpc/client @trpc/react-query @trpc/next

# Data Management
pnpm add @tanstack/react-query zod zustand
pnpm add react-hook-form @hookform/resolvers date-fns

# Utilities
pnpm add qrcode react-qr-code @upstash/redis resend
pnpm add bcryptjs jsonwebtoken axios
```

#### UI Dependencies

```bash
# UI Components
pnpm add lucide-react clsx tailwind-merge
pnpm add @radix-ui/react-dialog @radix-ui/react-select
pnpm add @radix-ui/react-dropdown-menu

# Initialize shadcn/ui
npx shadcn-ui@latest init

# Install components
npx shadcn-ui@latest add button input card form table select dialog toast avatar badge tabs calendar
```

#### Development Dependencies

```bash
pnpm add -D @types/node @types/bcryptjs @types/jsonwebtoken
pnpm add -D @types/react @types/react-dom
pnpm add -D eslint-config-next prettier typescript
```

### Step 4: Configure Environment Variables

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Fill in all required values. See [SETUP_GUIDE.md](./SETUP_GUIDE.md#environment-variables-template) for complete list.

**Minimum required for development:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Step 5: Set Up Services

#### 5.1 Supabase Setup

1. Create project at https://supabase.com
2. Get API keys from Project Settings → API
3. Enable Email authentication
4. Create storage buckets:
   - `resumes` (private)
   - `event-images` (public)

#### 5.2 Database Schema

Run SQL schema in Supabase SQL Editor:

```sql
-- See database/schema.sql for complete schema
-- Creates: users, events, event_registrations, etc.
```

#### 5.3 Configure Row-Level Security

Enable RLS on all tables:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- ... etc
```

See [SETUP_GUIDE.md](./SETUP_GUIDE.md#database-setup) for complete RLS policies.

### Step 6: Project Structure

Create the following directory structure:

```
cmis-event-management-system/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── features/
│   └── forms/
├── lib/
│   ├── supabase/
│   ├── trpc/
│   └── utils/
├── server/
│   ├── routers/
│   └── middleware/
├── database/
│   ├── schema.sql
│   └── migrations/
└── public/
```

### Step 7: Build Configuration

#### TypeScript Config

Ensure `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

#### Tailwind Config

Update `tailwind.config.ts` with custom theme (TAMU maroon):

```typescript
theme: {
  extend: {
    colors: {
      primary: '#500000', // TAMU Maroon
    },
  },
}
```

### Step 8: Build and Run

#### Development Build

```bash
# Install all dependencies
pnpm install

# Start development server
pnpm dev
```

Application runs at http://localhost:3000

#### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

#### Type Checking

```bash
pnpm type-check
```

#### Linting

```bash
pnpm lint
```

#### Formatting

```bash
pnpm format
```

## 🔧 Common Build Issues

### Issue: Module Not Found

```bash
# Solution: Delete and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
pnpm dev -- -p 3001
```

### Issue: TypeScript Errors

```bash
# Restart TS server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or check types manually
pnpm type-check
```

### Issue: Supabase Connection Failed

- Verify environment variables are set
- Check Supabase project is active
- Verify API keys in Supabase dashboard

### Issue: Build Fails

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
pnpm build
```

## 📦 Deployment

### Development

- Runs locally on `localhost:3000`
- Hot reload enabled
- Full error messages

### Staging

1. Push to `develop` branch
2. Vercel auto-deploys to staging
3. Test at staging URL

### Production

1. Merge to `main` branch
2. Vercel auto-deploys to production
3. Configure custom domain (optional)

See [SETUP_GUIDE.md](./SETUP_GUIDE.md#deployment-strategy) for detailed deployment instructions.

## ✅ Build Verification Checklist

After building, verify:

- [ ] Application starts without errors
- [ ] Can access http://localhost:3000
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Environment variables loaded
- [ ] Database connection works
- [ ] Authentication pages load
- [ ] Build completes successfully

## 🎯 Next Steps

After successful build:

1. ✅ Set up database schema
2. ✅ Configure authentication
3. ✅ Create first API endpoints
4. ✅ Build first components
5. ✅ Follow [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)

## 📞 Getting Help

- **Setup Issues:** See [SETUP_GUIDE.md - Troubleshooting](./SETUP_GUIDE.md#troubleshooting)
- **Build Errors:** Check error messages, verify dependencies
- **Configuration:** Review environment variables
- **Service Setup:** Follow service-specific setup in SETUP_GUIDE.md

---

**Build successful? Time to start coding! 🚀**

