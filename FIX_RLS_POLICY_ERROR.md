# 🔧 Fix: RLS Policy Error During Signup

## Error Message
```
Account created but profile setup failed: new row violates row-level security 
policy for table "users". Please contact support.
```

## Problem
Row-Level Security (RLS) policies are blocking the INSERT into the `users` table during signup. This happens because the default RLS policies don't allow users to insert their own profile.

## ✅ Solution: Run RLS Fix Script

### Step 1: Open Supabase SQL Editor
1. Go to your **Supabase Dashboard**
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### Step 2: Run the Fix Script
1. Open file: `scripts/fix-user-signup-rls-complete.sql`
2. **Copy ALL the SQL commands** (the entire file)
3. **Paste** into Supabase SQL Editor
4. Click **"Run"** button (or press Cmd+Enter / Ctrl+Enter)

### Step 3: Verify It Worked
After running, you should see:
- ✅ Table status showing RLS is enabled
- ✅ List of policies created (should show 5 policies)
- ✅ Confirmation query showing success

---

## Quick Copy-Paste Fix

If you want the essential fix only, run this:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON users;

-- Create the critical INSERT policy
CREATE POLICY "Authenticated users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create other necessary policies
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

---

## What This Does

The fix creates RLS policies that allow:
1. ✅ **INSERT:** Users can insert their own profile during signup (`auth.uid() = id`)
2. ✅ **SELECT:** Users can view their own profile
3. ✅ **UPDATE:** Users can update their own profile

---

## After Running the Fix

1. **Refresh your browser** (to clear any cached errors)
2. **Try creating a user account again**
3. ✅ Should work now!

---

## Verify It's Fixed

Run this query in Supabase SQL Editor to verify:

```sql
-- Check if INSERT policy exists
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'users'
AND cmd = 'INSERT';
```

You should see:
- `policyname`: "Authenticated users can insert own profile"
- `cmd`: "INSERT"
- `with_check`: Should show `(auth.uid() = id)`

---

## Troubleshooting

### Still Getting Errors?

1. **Check Browser Console:**
   - Press F12
   - Go to Console tab
   - Look for the exact error message

2. **Verify User is Authenticated:**
   - The policy requires `auth.uid()` to exist
   - Make sure signup creates the auth user first
   - Check Supabase Dashboard → Authentication → Users

3. **Check Policy Exists:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```
   Should show at least 3 policies (INSERT, SELECT, UPDATE)

4. **Temporarily Disable RLS (Testing Only):**
   ```sql
   -- WARNING: Only for testing, not for production!
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ```
   Then try signup again. If it works, RLS was the issue.

---

## Why This Happens

Supabase enables RLS by default for security. Without proper policies:
- ❌ Users can't insert their own profile
- ❌ Users can't view their own data
- ❌ Users can't update their own data

The fix creates policies that allow these operations while maintaining security.

---

✅ **Ready to fix?** Run the SQL script in Supabase SQL Editor!

