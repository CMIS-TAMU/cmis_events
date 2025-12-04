-- ============================================================================
-- CREATE AUTH USERS FOR TEST ACCOUNTS
-- ============================================================================
-- This script creates auth users for test accounts
-- NOTE: This requires service role access or admin permissions
-- ============================================================================
-- 
-- IMPORTANT: If you get permission errors, use Supabase Auth UI instead:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Enter email and password for each test account
-- ============================================================================

-- Test Users (emails from setup_mentorship_test_data.sql)
-- Student 1: test.student1@tamu.edu
-- Student 2: test.student2@tamu.edu
-- Mentor 1: test.mentor1@example.com
-- Mentor 2: test.mentor2@example.com
-- Mentor 3: test.mentor3@example.com

-- ============================================================================
-- OPTION 1: Using Supabase Auth UI (RECOMMENDED)
-- ============================================================================
-- This is the easiest and most reliable method:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. For each test account:
--    - Email: (from list below)
--    - Password: Set a password you can remember (e.g., "Test123!")
--    - Auto Confirm User: ✅ (check this)
-- ============================================================================

-- ============================================================================
-- OPTION 2: Using Supabase Management API (If you have API access)
-- ============================================================================
-- See: create_auth_users.js for automated script
-- ============================================================================

-- ============================================================================
-- OPTION 3: Direct SQL Insert (Requires service role - NOT RECOMMENDED)
-- ============================================================================
-- WARNING: This requires direct access to auth schema
-- Only use if you have admin/service role permissions
-- ============================================================================

-- This is a placeholder - actual auth user creation should be done via:
-- 1. Supabase Auth UI (easiest)
-- 2. Management API script
-- 3. Supabase CLI

-- For security reasons, we don't create auth users via SQL directly
-- Instead, use the JavaScript script or Supabase Auth UI

SELECT '⚠️  Auth users must be created via Supabase Auth UI or Management API' as instruction;
SELECT 'See: database/test-data/create_auth_users.js for automated option' as script;
SELECT 'Or use: Supabase Dashboard → Authentication → Users' as manual;

-- ============================================================================
-- VERIFICATION: Check if auth users exist (run after creating)
-- ============================================================================

-- This query shows which test accounts need auth users created
SELECT 
  u.email,
  u.full_name,
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ Auth user exists'
    ELSE '❌ Auth user missing - create in Supabase Auth UI'
  END as auth_status
FROM users u
LEFT JOIN auth.users au ON u.email = au.email
WHERE u.id IN (
  '00000000-0000-0000-0000-000000000001', -- Student 1
  '00000000-0000-0000-0000-000000000002', -- Student 2
  '00000000-0000-0000-0000-000000000101', -- Mentor 1
  '00000000-0000-0000-0000-000000000102', -- Mentor 2
  '00000000-0000-0000-0000-000000000103'  -- Mentor 3
);

