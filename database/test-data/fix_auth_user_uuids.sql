-- ============================================================================
-- FIX AUTH USER UUIDs TO MATCH TEST DATA
-- ============================================================================
-- If you already created auth users in Supabase Auth UI, this script
-- will help you link them to the test data users.
-- 
-- NOTE: Supabase doesn't allow changing auth user UUIDs directly.
-- You need to either:
-- 1. Delete the incorrectly created auth users and use the script
-- 2. Update the users table to match the auth user UUIDs
-- ============================================================================

-- ============================================================================
-- OPTION 1: Check Current State
-- ============================================================================
-- First, let's see what UUIDs exist:

SELECT 
  'users table' as source,
  id,
  email,
  full_name
FROM users
WHERE email IN (
  'test.student1@tamu.edu',
  'test.student2@tamu.edu',
  'test.mentor1@example.com',
  'test.mentor2@example.com',
  'test.mentor3@example.com'
)
ORDER BY email;

-- Check auth users (if you can access auth schema)
-- SELECT 
--   'auth.users' as source,
--   id,
--   email
-- FROM auth.users
-- WHERE email IN (
--   'test.student1@tamu.edu',
--   'test.student2@tamu.edu',
--   'test.mentor1@example.com',
--   'test.mentor2@example.com',
--   'test.mentor3@example.com'
-- )
-- ORDER BY email;

-- ============================================================================
-- OPTION 2: Update users table to match auth UUIDs
-- ============================================================================
-- If auth users already exist with different UUIDs, update the users table:
-- 
-- WARNING: This will break relationships! Only do this if:
-- 1. Test data relationships don't matter yet
-- 2. You're willing to re-run the test data script
-- 
-- Replace 'AUTH_USER_ID_HERE' with the actual auth user ID from Supabase:
--
-- UPDATE users
-- SET id = 'AUTH_USER_ID_HERE'
-- WHERE email = 'test.student1@tamu.edu';
--
-- ============================================================================

-- ============================================================================
-- OPTION 3: Delete and Recreate (RECOMMENDED)
-- ============================================================================
-- Best approach: Delete auth users with wrong UUIDs and use the script
--
-- Steps:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Delete the incorrectly created test users
-- 3. Run: node database/test-data/create_auth_users.js
--    (This will create users with correct UUIDs)
--
-- ============================================================================

-- ============================================================================
-- VERIFICATION: Check if UUIDs match
-- ============================================================================

-- This query shows users and their expected auth UUIDs
SELECT 
  u.email,
  u.full_name,
  u.id as expected_auth_id,
  'Run the JavaScript script to create auth users with matching UUIDs' as action
FROM users u
WHERE u.email IN (
  'test.student1@tamu.edu',
  'test.student2@tamu.edu',
  'test.mentor1@example.com',
  'test.mentor2@example.com',
  'test.mentor3@example.com'
)
ORDER BY u.email;

