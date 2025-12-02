-- TEMPORARY: Disable RLS Completely to Test
-- Use this ONLY for testing - re-enable after confirming role works
-- Run this in Supabase SQL Editor

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'users';

-- Test query (should work without any policies)
SELECT id, email, role 
FROM users 
WHERE email = 'abhishekp1703@gmail.com';

-- NOTE: After confirming this works, you can either:
-- 1. Re-enable RLS and use the fix script
-- 2. Keep RLS disabled for development (NOT recommended for production)

