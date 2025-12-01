# 🎯 Complete RLS Solution - Multiple Approaches

## The Problem
RLS policies keep blocking user profile creation during signup.

## ✅ Solution: Use API Route with Service Role Key

This is the **simplest and most reliable** solution. I've created an API route that uses the service role key to bypass RLS entirely.

---

## What I Just Created

### 1. API Route (Bypasses RLS)
- **File:** `app/api/user/create-profile/route.ts`
- Uses service role key to create user profile
- Bypasses RLS completely
- Safe and secure

### 2. Updated Signup Code
- **File:** `app/(auth)/signup/page.tsx` (updated)
- Now calls the API route instead of direct database insert
- Handles errors gracefully

---

## Setup Steps

### Step 1: Verify Environment Variable

Make sure your `.env.local` has:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Get it from:**
- Supabase Dashboard → Settings → API
- Copy "service_role" key (not the anon key!)

### Step 2: Restart Server

After adding the environment variable:
```bash
# Stop server (Ctrl+C)
pnpm dev
```

### Step 3: Test Signup

1. Refresh browser
2. Create a user account
3. ✅ Should work now!

---

## How It Works

1. User fills signup form
2. Supabase Auth creates auth user
3. **Signup code calls API route** (`/api/user/create-profile`)
4. **API route uses service role key** (bypasses RLS)
5. User profile created successfully
6. Done! ✅

---

## Alternative: Use Database Trigger

If the API route doesn't work, you can use the database trigger:

**File:** `BEST_RLS_FIX_TRIGGER.sql`

Run this in Supabase SQL Editor - it automatically creates user profile when auth user is created.

---

## Alternative: Disable RLS Temporarily (Testing Only!)

**WARNING:** Only for testing!

```sql
-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Test signup

-- Re-enable after testing
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

---

## Which Solution to Use?

### Option 1: API Route (Recommended) ✅
- ✅ Already implemented in code
- ✅ Just needs service role key
- ✅ Most reliable

### Option 2: Database Trigger
- ✅ Automatic
- ✅ No code changes needed
- Run: `BEST_RLS_FIX_TRIGGER.sql`

### Option 3: Disable RLS (Testing Only!)
- ⚠️ Not for production
- Good for quick testing

---

## Quick Checklist

- [ ] Service role key in `.env.local`
- [ ] Server restarted
- [ ] Try creating user account
- [ ] Should work! ✅

---

## Troubleshooting

### Still Getting Errors?

1. **Check service role key:**
   ```bash
   grep SUPABASE_SERVICE_ROLE_KEY .env.local
   ```
   Should show a long key starting with `eyJ...`

2. **Check API route exists:**
   - File should exist: `app/api/user/create-profile/route.ts`

3. **Check browser console:**
   - Press F12
   - Look for errors in Console tab
   - Check Network tab for failed requests

4. **Check server logs:**
   - Look at terminal running `pnpm dev`
   - Should see any errors there

---

## Success!

Once working, user signup will:
- ✅ Create auth user
- ✅ Create user profile (via API route)
- ✅ Redirect to login
- ✅ User can login

---

**Ready to test?** Make sure service role key is set, restart server, then try signup! 🚀

