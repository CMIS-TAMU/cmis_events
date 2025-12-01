-- Complete Fix for User Signup RLS Policy Issue
-- Run this in Supabase SQL Editor to fix the "new row violates row-level security policy" error
-- This script is idempotent - safe to run multiple times

-- ============================================================================
-- STEP 1: Check Current RLS Status
-- ============================================================================

-- Verify RLS is enabled
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'users';

-- ============================================================================
-- STEP 2: Enable RLS (if not already enabled)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: Drop Existing Conflicting Policies
-- ============================================================================

-- Drop all existing policies on users table to start fresh
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Public can insert during signup" ON users;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- ============================================================================
-- STEP 4: Create New RLS Policies
-- ============================================================================

-- Policy 1: Allow authenticated users to INSERT their own profile during signup
-- This is the critical one for signup to work!
CREATE POLICY "Authenticated users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy 2: Users can SELECT (view) their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Policy 3: Users can UPDATE their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Admins can SELECT (view) all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Policy 5: Admins can UPDATE all users
CREATE POLICY "Admins can update all users"
ON users FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- ============================================================================
-- STEP 5: Verify Policies Were Created
-- ============================================================================

-- Show all policies on users table
SELECT 
    policyname,
    cmd as operation,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has USING clause'
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'users'
ORDER BY 
    CASE cmd
        WHEN 'INSERT' THEN 1
        WHEN 'SELECT' THEN 2
        WHEN 'UPDATE' THEN 3
        WHEN 'DELETE' THEN 4
        ELSE 5
    END,
    policyname;

-- ============================================================================
-- STEP 6: Test Query (for verification)
-- ============================================================================

-- This query should show that RLS is enabled and policies exist
SELECT 
    '✅ RLS is enabled on users table' as status
WHERE EXISTS (
    SELECT 1 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND rowsecurity = true
)
AND EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users'
    AND cmd = 'INSERT'
    AND policyname = 'Authenticated users can insert own profile'
);

-- ============================================================================
-- IMPORTANT NOTES:
-- ============================================================================
-- 
-- 1. The INSERT policy is critical: auth.uid() = id
--    This ensures users can only insert a row where their auth ID matches the row ID
--    This is exactly what happens during signup!
--
-- 2. If you still get errors after running this:
--    - Make sure you're logged in when signing up (check Supabase Auth)
--    - Check browser console for exact error message
--    - Verify the user ID in auth.users matches what's being inserted
--
-- 3. To disable RLS temporarily for testing (NOT RECOMMENDED FOR PRODUCTION):
--    ALTER TABLE users DISABLE ROW LEVEL SECURITY;
--
-- ============================================================================

