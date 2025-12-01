# 🚨 URGENT: Fix Admin Role Right Now

## Quick SQL Fix

**Run this ENTIRE script in Supabase SQL Editor:**

```sql
-- URGENT FIX: Make abhishekp1703@gmail.com admin
-- Run this entire block at once

-- Create/Update user profile with admin role
INSERT INTO users (id, email, full_name, role)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Admin') as full_name,
    'admin' as role
FROM auth.users au
WHERE au.email = 'abhishekp1703@gmail.com'
ON CONFLICT (email) DO UPDATE
SET role = 'admin';

-- Force update by email
UPDATE users 
SET role = 'admin' 
WHERE email = 'abhishekp1703@gmail.com';

-- Force update by ID (backup method)
UPDATE users
SET role = 'admin'
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'abhishekp1703@gmail.com'
);

-- Verify - MUST show role = 'admin'
SELECT 
    '✅ CHECK RESULT' as status,
    email, 
    role, 
    full_name
FROM users 
WHERE email = 'abhishekp1703@gmail.com';
```

**After running:**
1. Check the SELECT result - should show `role = 'admin'`
2. If it does, clear browser cache and login again
3. Visit: http://localhost:3000/debug-role
4. Should show you as admin!

---

## Still Not Working?

**Run this diagnostic SQL:**

```sql
-- Check everything
SELECT 
    'auth.users' as table_name,
    id,
    email,
    email_confirmed_at
FROM auth.users
WHERE email = 'abhishekp1703@gmail.com'

UNION ALL

SELECT 
    'public.users' as table_name,
    id::text,
    email,
    role::text
FROM users
WHERE email = 'abhishekp1703@gmail.com';
```

**Share the results and I'll help fix it!**

