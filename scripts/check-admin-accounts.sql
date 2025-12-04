-- ============================================================================
-- Check Admin Accounts Script
-- ============================================================================
-- This script lists all users with admin role in the database
-- ============================================================================

-- 1. List all admin accounts
SELECT 
    id,
    email,
    full_name,
    role,
    created_at,
    metadata
FROM users
WHERE role = 'admin'
ORDER BY created_at DESC;

-- 2. Count total admin accounts
SELECT 
    COUNT(*) as total_admins
FROM users
WHERE role = 'admin';

-- 3. List all users with their roles (for reference)
SELECT 
    email,
    full_name,
    role,
    created_at
FROM users
ORDER BY 
    CASE role
        WHEN 'admin' THEN 1
        WHEN 'faculty' THEN 2
        WHEN 'sponsor' THEN 3
        ELSE 4
    END,
    created_at DESC;

-- 4. Check specific email (replace with your email)
-- SELECT 
--     id,
--     email,
--     full_name,
--     role,
--     created_at
-- FROM users
-- WHERE email = 'your-email@example.com';

