-- Fix RLS Policy for Resume Upload
-- Run this in Supabase SQL Editor to allow users to update their own profile
-- This script is idempotent - safe to run multiple times

-- ============================================================================
-- STEP 1: Enable RLS (if not already enabled)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Drop Existing UPDATE Policy (if exists)
-- ============================================================================

DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- ============================================================================
-- STEP 3: Create UPDATE Policy
-- ============================================================================

-- Policy: Users can UPDATE their own profile
-- This allows authenticated users to update their own resume information
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STEP 4: Verify Policy Was Created
-- ============================================================================

SELECT 
    policyname,
    cmd as operation,
    '✅ Created' as status
FROM pg_policies
WHERE tablename = 'users'
AND cmd = 'UPDATE'
ORDER BY policyname;

-- ✅ Done! Users should now be able to update their own profile/resume.


