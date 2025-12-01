-- Complete Admin Fix for abhishekp1703@gmail.com
-- This script handles all edge cases
-- Run this ENTIRE script in Supabase SQL Editor

-- Step 1: Check if user exists in auth.users
SELECT 
    'Step 1: Check auth.users' as step,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email = 'abhishekp1703@gmail.com';

-- Step 2: Check if user exists in public.users
SELECT 
    'Step 2: Check public.users' as step,
    id,
    email,
    full_name,
    role,
    created_at
FROM users
WHERE email = 'abhishekp1703@gmail.com';

-- Step 3: Create or update user profile with admin role
-- This handles: user doesn't exist, user exists but wrong role, etc.
INSERT INTO users (id, email, full_name, role)
SELECT 
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'full_name',
        SPLIT_PART(au.email, '@', 1)
    ) as full_name,
    'admin' as role
FROM auth.users au
WHERE au.email = 'abhishekp1703@gmail.com'
ON CONFLICT (email) DO UPDATE
SET 
    role = 'admin',
    full_name = COALESCE(
        EXCLUDED.full_name,
        users.full_name,
        SPLIT_PART(EXCLUDED.email, '@', 1)
    );

-- Step 4: Also try updating by ID (in case email doesn't match exactly)
UPDATE users
SET role = 'admin'
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'abhishekp1703@gmail.com'
);

-- Step 5: Force update role one more time by email
UPDATE users 
SET role = 'admin' 
WHERE email = 'abhishekp1703@gmail.com';

-- Step 6: Verify final status
SELECT 
    'Final Status - Should show admin' as step,
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.created_at,
    au.email_confirmed_at as email_verified
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'abhishekp1703@gmail.com'
   OR au.email = 'abhishekp1703@gmail.com';

-- Step 7: List all users to verify
SELECT 
    'All Users' as step,
    email,
    role,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

