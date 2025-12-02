-- Fix RLS Policies for Users Table
-- This allows users to read their own profile and all users for search
-- Run this in Supabase SQL Editor

-- Step 1: Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;

-- Step 2: Enable RLS (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policy to allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Step 4: Create policy to allow authenticated users to read all users (for search functionality)
CREATE POLICY "Authenticated users can read all users"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Step 5: Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Expected: Should see 2 policies:
-- 1. "Users can read own profile" - FOR SELECT
-- 2. "Authenticated users can read all users" - FOR SELECT

