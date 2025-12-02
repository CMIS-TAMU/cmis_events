-- Fix Infinite Recursion in RLS Policies
-- This error happens when policies reference the same table they protect
-- Run this ENTIRE script in Supabase SQL Editor

-- Step 1: Drop ALL existing policies on users table
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can read all users" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Step 2: Temporarily disable RLS to reset
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 3: Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, non-recursive policies
-- Policy 1: Users can read their own profile (using auth.uid() which doesn't query users table)
CREATE POLICY "users_select_own"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Authenticated users can read all users (for search functionality)
-- This is safe because it doesn't reference the users table
CREATE POLICY "users_select_all"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Step 5: Allow users to update their own profile
CREATE POLICY "users_update_own"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 6: Verify policies were created
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

-- Expected: Should see 3 policies without errors

