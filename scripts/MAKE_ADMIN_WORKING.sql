-- WORKING FIX: Make abhishekp1703@gmail.com admin
-- This script handles ALL edge cases
-- Run this ENTIRE block in Supabase SQL Editor

-- Step 1: Check current status (diagnostic)
SELECT 
    'BEFORE FIX' as status,
    u.id,
    u.email,
    u.role,
    u.full_name
FROM users u
WHERE u.email = 'abhishekp1703@gmail.com';

-- Step 2: Get user ID from auth.users
WITH auth_user AS (
    SELECT id, email, raw_user_meta_data
    FROM auth.users
    WHERE email = 'abhishekp1703@gmail.com'
)
-- Step 3: Insert or update user with admin role
INSERT INTO users (id, email, full_name, role)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Admin User') as full_name,
    'admin' as role
FROM auth_user au
ON CONFLICT (id) DO UPDATE
SET 
    role = 'admin',
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name);

-- Step 4: Also try by email (in case of ID mismatch)
UPDATE users 
SET role = 'admin' 
WHERE email = 'abhishekp1703@gmail.com';

-- Step 5: Final verification
SELECT 
    'AFTER FIX - MUST SHOW ADMIN' as status,
    u.id,
    u.email,
    u.role,
    u.full_name,
    CASE 
        WHEN u.role = 'admin' THEN '✅ SUCCESS - You are admin!'
        ELSE '❌ FAILED - Role is still: ' || u.role
    END as result
FROM users u
WHERE u.email = 'abhishekp1703@gmail.com';

-- If above returns empty, user profile doesn't exist - run this:
-- Step 6: Create user if it doesn't exist at all
DO $$
DECLARE
    v_user_id uuid;
    v_email text := 'abhishekp1703@gmail.com';
BEGIN
    -- Get user ID from auth.users
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_email
    LIMIT 1;

    -- If user exists in auth but not in public.users, create it
    IF v_user_id IS NOT NULL THEN
        INSERT INTO users (id, email, full_name, role)
        VALUES (
            v_user_id,
            v_email,
            'Admin User',
            'admin'
        )
        ON CONFLICT (id) DO UPDATE
        SET role = 'admin';
        
        RAISE NOTICE 'User profile created/updated with admin role';
    ELSE
        RAISE NOTICE 'User not found in auth.users - please sign up first';
    END IF;
END $$;

-- Step 7: Final check
SELECT 
    'FINAL CHECK' as status,
    email,
    role,
    CASE 
        WHEN role = 'admin' THEN '✅ You are admin!'
        ELSE '❌ Role is: ' || role
    END as message
FROM users
WHERE email = 'abhishekp1703@gmail.com';

