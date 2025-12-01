# 🔧 Fix Admin Role - Step by Step

## ❌ Problem
You ran the SQL query but debug page still doesn't show you as admin.

---

## ✅ Complete Fix Process

### Step 1: Check What's Actually in Database

**Run this in Supabase SQL Editor:**

```sql
-- Check if you exist in auth.users
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'abhishekp1703@gmail.com';

-- Check if you exist in public.users
SELECT id, email, role, full_name 
FROM users 
WHERE email = 'abhishekp1703@gmail.com';
```

**Note the results:**
- Does user exist in auth.users? ✅/❌
- Does user exist in public.users? ✅/❌
- What is the current role? ___________

---

### Step 2: Run Complete Fix Script

**Copy and paste this ENTIRE script:**

```sql
-- COMPLETE FIX FOR abhishekp1703@gmail.com
-- Run this entire block

-- First, ensure user profile exists (create if doesn't)
INSERT INTO users (id, email, full_name, role)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Admin User') as full_name,
    'admin' as role
FROM auth.users au
WHERE au.email = 'abhishekp1703@gmail.com'
ON CONFLICT (email) DO UPDATE
SET role = 'admin';

-- Force update role
UPDATE users 
SET role = 'admin' 
WHERE email = 'abhishekp1703@gmail.com';

-- Also update by ID (in case email has case issues)
UPDATE users
SET role = 'admin'
WHERE id IN (
    SELECT id FROM auth.users WHERE LOWER(email) = 'abhishekp1703@gmail.com'
);

-- Verify
SELECT email, role, full_name FROM users WHERE email = 'abhishekp1703@gmail.com';
```

**Expected Result:** Should show `role = 'admin'`

---

### Step 3: If Still Not Working - Check Case Sensitivity

**Email might have case differences. Try this:**

```sql
-- Check what email is actually stored
SELECT email, role 
FROM users 
WHERE LOWER(email) = 'abhishekp1703@gmail.com';

-- Update regardless of case
UPDATE users 
SET role = 'admin' 
WHERE LOWER(email) = 'abhishekp1703@gmail.com';
```

---

### Step 4: Verify in Database

**Run this to see all your data:**

```sql
SELECT 
    u.email,
    u.role,
    u.full_name,
    au.email as auth_email,
    au.email_confirmed_at
FROM users u
FULL OUTER JOIN auth.users au ON u.id = au.id
WHERE u.email = 'abhishekp1703@gmail.com' 
   OR au.email = 'abhishekp1703@gmail.com';
```

---

### Step 5: Clear Everything and Test

1. **Logout** from the application
2. **Clear browser data:**
   - All cookies for localhost
   - All cached data
3. **Close ALL browser tabs**
4. **Open incognito window**
5. **Login again**
6. **Visit:** http://localhost:3000/debug-role
7. **Check:** Does it show `role = 'admin'`?

---

## 🐛 Troubleshooting

### Issue: "User not found in public.users"

**Fix:**
```sql
-- Create user profile
INSERT INTO users (id, email, full_name, role)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', 'Admin User'),
    'admin'
FROM auth.users
WHERE email = 'abhishekp1703@gmail.com';
```

### Issue: "Email doesn't match exactly"

**Fix:**
```sql
-- Update by ID instead
UPDATE users
SET role = 'admin'
WHERE id = (
    SELECT id FROM auth.users WHERE email = 'abhishekp1703@gmail.com'
);
```

### Issue: "Role shows but debug page still doesn't"

**Fix:**
- This is a caching issue
- Clear browser cache completely
- Use incognito window
- Restart dev server: Stop and run `pnpm dev` again

---

## ✅ Success Check

After running the fix:

1. **Run this SQL:**
```sql
SELECT email, role FROM users WHERE email = 'abhishekp1703@gmail.com';
```

2. **Should show:** `role = 'admin'`

3. **Then:**
   - Clear browser cache
   - Logout
   - Login in incognito
   - Visit `/debug-role`
   - Should show you as admin ✅

---

**Run the complete fix script above and let me know what the SELECT query returns!**

