# Quick Start Guide - CMIS Event Management System

Get up and running in 15 minutes! This guide provides the fastest path to a working development environment.

## Prerequisites Check

Run these commands to verify you have everything installed:

```bash
node --version   # Should be v20.x.x or higher
pnpm --version   # Should be 8.x.x or higher
git --version    # Should be installed
```

If any are missing, see the [Complete Setup Guide](./SETUP_GUIDE.md).

## 5-Minute Setup

### Step 1: Create Project Directory (2 min)

```bash
# Navigate to your projects folder
cd ~/Documents/Projects

# Create and enter project directory
# Clone the existing repository
git clone https://github.com/CMIS-TAMU/cmis_events.git
cd cmis_events

# Initialize Git
git init
```

### Step 2: Initialize Next.js Project (3 min)

```bash
# Create Next.js app with all configurations
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --use-pnpm \
  --no-src-dir \
  --import-alias "@/*"

# Answer prompts:
# - Would you like to use `src/` directory? → No
# - Would you like to use App Router? → Yes
# - Would you like to customize the default import alias? → No
```

### Step 3: Install Essential Dependencies (5 min)

```bash
# Core backend dependencies
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
pnpm add @trpc/server @trpc/client @trpc/react-query @trpc/next
pnpm add @tanstack/react-query zod zustand
pnpm add react-hook-form @hookform/resolvers date-fns

# Essential UI libraries
pnpm add lucide-react clsx tailwind-merge
pnpm add @radix-ui/react-dialog @radix-ui/react-select

# Initialize shadcn/ui
npx shadcn-ui@latest init
# Answer: TypeScript: Yes, Style: Default, Base: Slate, CSS Variables: Yes

# Add essential components
npx shadcn-ui@latest add button input card form dialog
```

### Step 4: Create Environment File (2 min)

```bash
# Copy the example file
cp .env.example .env.local

# Open .env.local in your editor and add at minimum:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

> **Note:** For now, you can use placeholder values to get the app running. Add real credentials later.

### Step 5: Start Development Server (1 min)

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the Next.js welcome page!

## Next Steps

1. ✅ **Set up services** - Follow [Setup Guide - Service Configuration](./SETUP_GUIDE.md#service-configuration)
2. ✅ **Configure database** - See [Setup Guide - Database Setup](./SETUP_GUIDE.md#database-setup)
3. ✅ **Start building** - Check [Development Roadmap](./DEVELOPMENT_ROADMAP.md)

## Common Issues

### Port 3000 Already in Use

```bash
# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
pnpm dev -- -p 3001
```

### pnpm Not Found

```bash
npm install -g pnpm
```

### Module Resolution Errors

```bash
# Delete and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Getting Help

- **Detailed Setup:** See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Project Roadmap:** See [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)
- **Troubleshooting:** Check [SETUP_GUIDE.md - Troubleshooting](./SETUP_GUIDE.md#troubleshooting)

---

**That's it! You're ready to start building. 🚀**

