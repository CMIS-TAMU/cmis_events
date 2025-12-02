# 🔧 Fix: Role Shows NULL on Webpage (But Admin in Database)

## 🎯 Problem

- ✅ Role is `'admin'` in Supabase database
- ✅ User exists in both `auth.users` and `public.users`
- ❌ Webpage shows `null` or doesn't show admin role

---

## 🐛 Root Causes

### 1. **RLS Policy Blocking Query**

The query might be blocked by Row-Level Security policies.

**Check RLS policies:**

Run this SQL in Supabase:
```sql
-- Check RLS policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users';
```

**If no policies exist or policies are too restrictive, fix them:**

```sql
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

-- Allow authenticated users to read all users (for team search)
CREATE POLICY "Authenticated users can read all users"
ON users
FOR SELECT
TO authenticated
USING (true);
```

---

### 2. **User ID Mismatch**

The user ID in `auth.users` might not match the ID in `public.users`.

**Check for mismatch:**

```sql
-- Compare IDs
SELECT 
    au.id as auth_id,
    au.email as auth_email,
    pu.id as public_id,
    pu.email as public_email,
    pu.role,
    CASE 
        WHEN au.id = pu.id THEN '✅ IDs match'
        ELSE '❌ IDs DO NOT MATCH'
    END as status
FROM auth.users au
LEFT JOIN users pu ON au.id = pu.id
WHERE au.email = 'abhishekp1703@gmail.com';
```

**If IDs don't match, fix it:**

```sql
-- Fix ID mismatch
UPDATE users
SET id = (SELECT id FROM auth.users WHERE email = 'abhishekp1703@gmail.com')
WHERE email = 'abhishekp1703@gmail.com';
```

---

### 3. **Query Not Finding User**

The query might be failing silently.

**Check what the query actually returns:**

```sql
-- Test the exact query that the app uses
SELECT *
FROM users
WHERE id = (SELECT id FROM auth.users WHERE email = 'abhishekp1703@gmail.com')
LIMIT 1;
```

---

## ✅ Quick Fix Steps

### Step 1: Verify RLS Policies

**Run this to check if you can read your own profile:**

```sql
-- Test query (run as your user)
SELECT * FROM users WHERE email = 'abhishekp1703@gmail.com';
```

**If it returns empty:**
- RLS policy is blocking
- Fix with the policies above

**If it returns your user:**
- RLS is fine
- Check for ID mismatch

---

### Step 2: Fix RLS Policies (If Needed)

**Run this to ensure users can read their own profile:**

```sql
-- Drop existing restrictive policies (if any)
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Create new permissive policy
CREATE POLICY "Users can read own profile"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Also allow reading all users (for search functionality)
CREATE POLICY "Authenticated users can read all users"
ON users
FOR SELECT
TO authenticated
USING (true);
```

---

### Step 3: Verify Query Works

**After fixing RLS, test:**

1. **Visit:** http://localhost:3000/debug-role
2. **Check:** Does it show your role now?
3. **If still null:** Check browser console for errors

---

### Step 4: Clear Cache and Refresh

1. **Clear browser cache completely**
2. **Logout** from application
3. **Close all tabs**
4. **Open incognito window**
5. **Login again**
6. **Visit:** http://localhost:3000/debug-role

---

## 🔍 Advanced Debugging

### Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for Supabase errors
4. Common errors:
   - `permission denied for table users`
   - `new row violates row-level security policy`
   - `relation "users" does not exist`

### Test Query Directly

Open browser console and run:

```javascript
const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const { data: { user } } = await supabase.auth.getUser();
console.log('Auth user:', user);

const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single();

console.log('Profile:', data);
console.log('Error:', error);
```

---

## ✅ Most Likely Fix

**90% chance it's an RLS policy issue. Run this:**

```sql
-- Complete RLS fix
DROP POLICY IF EXISTS "Users can read own profile" ON users;

CREATE POLICY "Users can read own profile"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Verify it works
SELECT * FROM users WHERE email = 'abhishekp1703@gmail.com';
```

**Then:**
1. Clear browser cache
2. Logout/login
3. Check debug page

---

**Try the RLS fix first - that's most likely the issue!** 🚀

