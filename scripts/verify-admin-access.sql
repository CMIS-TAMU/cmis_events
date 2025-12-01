-- Verify Admin Access Script
-- Run this to check if your user is set as admin

-- 1. Check your user in auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email = 'abhishekp1703@gmail.com';

-- 2. Check your user in public.users
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM users
WHERE email = 'abhishekp1703@gmail.com';

-- 3. Make sure you're admin (run this if role is not 'admin')
UPDATE users 
SET role = 'admin' 
WHERE email = 'abhishekp1703@gmail.com';

-- 4. Verify again
SELECT 
    email,
    full_name,
    role,
    created_at
FROM users
WHERE email = 'abhishekp1703@gmail.com';

-- Expected result: role should be 'admin'

-- 5. List all admins
SELECT 
    email,
    full_name,
    role,
    created_at
FROM users
WHERE role = 'admin';

