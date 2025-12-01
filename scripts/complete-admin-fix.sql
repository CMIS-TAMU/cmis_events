-- Complete Admin Fix for abhishekp1703@gmail.com
-- Run this entire script in Supabase SQL Editor

-- Step 1: Check current status
SELECT 
    'Current Status' as step,
    u.email,
    u.role,
    u.full_name,
    CASE 
        WHEN au.id IS NULL THEN 'User not in auth.users'
        WHEN u.id IS NULL THEN 'User not in public.users'
        ELSE 'User exists in both tables'
    END as status
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE au.email = 'abhishekp1703@gmail.com';

-- Step 2: Create/Update user profile with admin role
INSERT INTO users (id, email, full_name, role)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Admin User') as full_name,
    'admin' as role
FROM auth.users au
WHERE au.email = 'abhishekp1703@gmail.com'
ON CONFLICT (email) DO UPDATE
SET 
    role = 'admin',
    full_name = COALESCE(EXCLUDED.full_name, users.full_name);

-- Step 3: Force update role (in case it didn't update)
UPDATE users 
SET role = 'admin' 
WHERE email = 'abhishekp1703@gmail.com';

-- Step 4: Verify final status
SELECT 
    'Final Status' as step,
    u.email,
    u.role,
    u.full_name,
    au.email_confirmed_at as email_verified,
    u.created_at
FROM users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'abhishekp1703@gmail.com';

-- Expected Result:
-- email: abhishekp1703@gmail.com
-- role: admin ✅

