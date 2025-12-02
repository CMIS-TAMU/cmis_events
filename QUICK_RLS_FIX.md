# ⚡ Quick RLS Fix - Role Shows NULL

## 🎯 Problem Confirmed

Your SQL query shows:
- ✅ User exists in `auth.users` with ID: `21f97341-6158-4b9e-b2d3-54544700f1b8`
- ✅ User exists in `public.users` with same ID
- ✅ Role is `admin` in database
- ❌ But webpage shows `null`

**This is 100% an RLS (Row Level Security) policy issue!**

---

## ✅ The Fix

### Step 1: Run This SQL in Supabase

**Copy and paste this ENTIRE script:**

```sql
-- Fix RLS Policies for Users Table
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create policy to allow authenticated users to read all users (for search)
CREATE POLICY "Authenticated users can read all users"
ON users
FOR SELECT
TO authenticated
USING (true);
```

---

### Step 2: Verify It Worked

**After running the SQL above, test if you can read your profile:**

```sql
-- Test query (should return your user with admin role)
SELECT * FROM users 
WHERE email = 'abhishekp1703@gmail.com';
```

**Expected Result:** Should show your user with `role = 'admin'`

**If it returns empty:** RLS is still blocking - check error messages

**If it shows your user:** ✅ RLS is fixed!

---

### Step 3: Clear Cache and Test

1. **Clear browser cache completely**
   - Chrome: `Cmd+Shift+Delete` (Mac) or `Ctrl+Shift+Delete` (Windows)
   - Select "All time" and check "Cached images and files"

2. **Clear cookies for localhost**
   - Chrome: Settings → Privacy → Cookies
   - Delete all cookies for `localhost:3000`

3. **Logout** from the application

4. **Close ALL browser tabs** for localhost

5. **Open NEW incognito/private window**
   - Mac: `Cmd+Shift+N`
   - Windows: `Ctrl+Shift+N`

6. **Login again** with `abhishekp1703@gmail.com`

7. **Visit:** http://localhost:3000/debug-role

8. **Check:** Should now show `role = 'admin'` ✅

---

## 🔍 Still Not Working?

### Check What Policies Exist

```sql
-- See all RLS policies on users table
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users';
```

**Should see:**
- `Users can read own profile` - SELECT
- `Authenticated users can read all users` - SELECT

### Test Query Directly

```sql
-- Test if you can read your own profile
SELECT id, email, role 
FROM users 
WHERE id = '21f97341-6158-4b9e-b2d3-54544700f1b8';
```

**If this works in SQL Editor but not in app:** 
- RLS is fixed
- It's a browser cache/session issue
- Follow Step 3 above more thoroughly

---

## ✅ Success Checklist

After fix:
- [ ] SQL policies created successfully
- [ ] Test query returns your user
- [ ] Cleared browser cache
- [ ] Cleared cookies
- [ ] Logged out
- [ ] Closed all tabs
- [ ] Opened incognito window
- [ ] Logged in again
- [ ] `/debug-role` shows `role = 'admin'`
- [ ] Can access `/admin/dashboard`
- [ ] See "Admin" link in navigation

---

**Run the RLS fix SQL above, then clear cache and login again!** 🚀

