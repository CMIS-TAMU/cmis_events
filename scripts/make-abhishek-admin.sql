-- ============================================================================
-- Make abhishekp1703@gmail.com Admin
-- ============================================================================
-- This script updates the user role to 'admin' for abhishekp1703@gmail.com
-- ============================================================================

-- Step 1: Check current role (optional - to see current status)
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM users
WHERE email = 'abhishekp1703@gmail.com';

-- Step 2: Update role to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'abhishekp1703@gmail.com';

-- Step 3: Verify the change (run this after the UPDATE)
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM users
WHERE email = 'abhishekp1703@gmail.com';

-- Expected result: role should now be 'admin'

