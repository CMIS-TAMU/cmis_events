# 🔧 Fix: Infinite Recursion in RLS Policies

## 🚨 Error Found

**Error Message:**
```
infinite recursion detected in policy for relation "users"
```

**What This Means:**
The RLS (Row Level Security) policies are causing an infinite loop. This happens when a policy tries to check the same table it's protecting.

---

## ✅ The Fix

### Step 1: Run This SQL Script

**Copy and paste this ENTIRE script into Supabase SQL Editor:**

```sql
-- Fix Infinite Recursion in RLS Policies
-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can read all users" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Temporarily disable RLS to reset
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "users_select_own"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "users_select_all"
ON users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_update_own"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

---

### Step 2: Verify Policies Were Created

**After running the script, verify:**

```sql
-- Check policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'users';
```

**Should show 3 policies:**
- `users_select_own` - SELECT
- `users_select_all` - SELECT
- `users_update_own` - UPDATE

---

### Step 3: Test the Query

**Test if you can read your profile:**

```sql
-- Test query (should work now)
SELECT id, email, role 
FROM users 
WHERE email = 'abhishekp1703@gmail.com';
```

**Expected:** Should return your user with `role = 'admin'`

---

### Step 4: Clear Cache and Test in App

1. **Clear browser cache completely**
   - Chrome: `Cmd+Shift+Delete` (Mac) or `Ctrl+Shift+Delete` (Windows)
   - Select "All time" and check all boxes

2. **Clear cookies for localhost**
   - Settings → Privacy → Cookies
   - Delete all cookies for `localhost:3000`

3. **Logout** from the application

4. **Close ALL browser tabs** for localhost

5. **Open NEW incognito window**
   - Mac: `Cmd+Shift+N`
   - Windows: `Ctrl+Shift+N`

6. **Login again** at http://localhost:3000/login

7. **Visit:** http://localhost:3000/debug-role

8. **Should now show:**
   - ✅ Your email
   - ✅ Database Role: `admin`
   - ✅ Is Admin? YES

---

## 🔍 Why This Happened

**Infinite recursion occurs when:**
- A policy on `users` table tries to query the `users` table
- For example: `USING (id IN (SELECT id FROM users WHERE ...))`
- This creates a loop: policy checks users → queries users → triggers policy → checks users → ...

**The fix:**
- Use `auth.uid()` which doesn't query the users table
- Create simple policies that don't reference the protected table
- Avoid nested queries in policies

---

## ✅ Success Checklist

After fix:
- [ ] SQL script ran without errors
- [ ] 3 policies created successfully
- [ ] Test query returns your user
- [ ] Cleared browser cache
- [ ] Cleared cookies
- [ ] Logged out
- [ ] Logged in again
- [ ] `/debug-role` shows your email and admin role
- [ ] No more "infinite recursion" error
- [ ] Can access `/admin/dashboard`

---

## 🐛 Still Not Working?

### Check for Other Policies

**Run this to see all policies:**

```sql
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'users';
```

**If you see policies with complex queries, drop them:**

```sql
DROP POLICY IF EXISTS "problematic_policy_name" ON users;
```

### Check RLS Status

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';
```

**Should show:** `rowsecurity = true`

---

**Run the fix SQL script above - it will resolve the infinite recursion error!** 🚀

