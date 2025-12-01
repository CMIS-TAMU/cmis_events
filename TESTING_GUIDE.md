# Verification & Testing Guide

Step-by-step verification and testing for the CMIS Event Management System.

## ✅ Step 1: Start Development Server

### Install Dependencies (if needed)
```bash
cd /Users/abhishekpatil/Documents/Projects/CMIS-Cursor
export PATH=~/.npm-global/bin:$PATH
pnpm install
```

### Start Development Server
```bash
pnpm dev
```

**Expected Result:**
- Server starts on http://localhost:3000
- You see the Next.js welcome page or your home page
- No errors in the terminal

**If you see errors:**
- Check that all dependencies are installed
- Verify Node.js version (should be v20+)
- Check for port conflicts (port 3000 already in use)

---

## ✅ Step 2: Test Database Connection

### Create Test File

Create `lib/test-db.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function testConnection() {
  const { data, error } = await supabase.from('users').select('count');
  console.log('Database connection:', error ? 'FAILED' : 'SUCCESS');
  if (error) {
    console.error('Error details:', error);
  }
  return { data, error };
}
```

### Create Test API Route

Create `app/api/test-db/route.ts`:

```typescript
import { testConnection } from '@/lib/test-db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await testConnection();
    return NextResponse.json({
      success: !result.error,
      message: result.error ? 'Database connection failed' : 'Database connection successful',
      error: result.error?.message || null,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error testing database',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
```

### Test the Connection

1. Make sure `.env.local` has your Supabase credentials
2. Start the dev server: `pnpm dev`
3. Visit: http://localhost:3000/api/test-db
4. Or use curl:
   ```bash
   curl http://localhost:3000/api/test-db
   ```

**Expected Result:**
- Returns JSON with `success: true`
- No errors in console

---

## ✅ Step 3: Test API Routes

### Create Health Check Endpoint

Create `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}
```

### Test Health Endpoint

```bash
curl http://localhost:3000/api/health
```

**Expected Result:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-01T...",
  "environment": "development"
}
```

---

## ✅ Step 4: Verify All Services

### Checklist

- [ ] **Development Server**
  - [ ] Server starts without errors
  - [ ] Home page loads at http://localhost:3000
  - [ ] No console errors

- [ ] **Supabase Connection**
  - [ ] Environment variables set (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
  - [ ] Test endpoint returns success
  - [ ] Can connect to Supabase project

- [ ] **Database Tables**
  - [ ] Schema.sql has been run in Supabase
  - [ ] Tables exist: users, events, event_registrations, etc.
  - [ ] Can query tables (test with test-db endpoint)

- [ ] **Environment Variables**
  - [ ] `.env.local` file exists
  - [ ] All required variables are set
  - [ ] No undefined variables in console

- [ ] **Dependencies**
  - [ ] All packages installed (`pnpm install` completed)
  - [ ] No missing module errors
  - [ ] TypeScript compiles without errors

---

## 🧪 Quick Test Script

Run this to test everything at once:

```bash
# 1. Check dependencies
echo "📦 Checking dependencies..."
pnpm list --depth=0

# 2. Check environment variables
echo "🔐 Checking environment variables..."
[ -f .env.local ] && echo "✅ .env.local exists" || echo "❌ .env.local missing"

# 3. Test build
echo "🔨 Testing build..."
pnpm build

# 4. Test health endpoint (if server is running)
echo "🏥 Testing health endpoint..."
curl http://localhost:3000/api/health 2>/dev/null || echo "Server not running - start with: pnpm dev"
```

---

## 🐛 Common Issues

### Issue: "Cannot find module"
**Solution:** Run `pnpm install`

### Issue: "Environment variable not found"
**Solution:** Check `.env.local` file exists and has all required variables

### Issue: "Database connection failed"
**Solution:** 
- Verify Supabase project is active
- Check API keys in `.env.local`
- Ensure database schema has been run

### Issue: "Port 3000 already in use"
**Solution:** 
```bash
lsof -ti:3000 | xargs kill -9
# Or use different port
pnpm dev -- -p 3001
```

---

**Ready to test? Let's start with Step 1!** 🚀

