-- Fix Admin Role for abhishekp1703@gmail.com
-- Run this in Supabase SQL Editor

-- Step 1: Check current user status
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.created_at,
    au.email_confirmed_at
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'abhishekp1703@gmail.com';

-- Step 2: Make sure user exists in both tables
-- If user exists in auth.users but not in public.users, create profile
INSERT INTO users (id, email, full_name, role)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', 'User') as full_name,
    'admin' as role
FROM auth.users
WHERE email = 'abhishekp1703@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'abhishekp1703@gmail.com'
  )
ON CONFLICT (email) DO UPDATE
SET role = 'admin';

-- Step 3: Force update role to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'abhishekp1703@gmail.com';

-- Step 4: Verify it worked
SELECT 
    email,
    full_name,
    role,
    created_at
FROM users
WHERE email = 'abhishekp1703@gmail.com';

-- Expected: role should be 'admin'

-- Step 5: Check if email is verified
SELECT 
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email = 'abhishekp1703@gmail.com';

