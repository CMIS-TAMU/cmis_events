-- COMPLETE RLS RESET - Fix Infinite Recursion
-- This aggressively drops ALL policies and recreates them
-- Run this ENTIRE script in Supabase SQL Editor

-- Step 1: Check what policies exist (diagnostic)
SELECT 
    'EXISTING POLICIES' as step,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'users';

-- Step 2: Drop ALL policies on users table (using CASCADE to remove dependencies)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON users CASCADE';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Step 3: Check for triggers that might cause recursion
SELECT 
    'EXISTING TRIGGERS' as step,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users';

-- Step 4: Disable RLS completely
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 5: Re-enable RLS (fresh start)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 6: Create ONLY the simplest possible policies
-- Policy 1: Users can read their own profile (most restrictive)
CREATE POLICY "users_own_select"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Allow all authenticated users to read all users (for search)
-- This is safe and doesn't cause recursion
CREATE POLICY "users_all_select"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Step 7: Verify policies
SELECT 
    'NEW POLICIES' as step,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'users';

-- Step 8: Test query (should work now)
SELECT 
    'TEST QUERY' as step,
    id,
    email,
    role
FROM users
WHERE email = 'abhishekp1703@gmail.com';

