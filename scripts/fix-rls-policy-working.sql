-- FIX RLS POLICY - This should actually work!
-- The issue might be that auth.uid() needs to be available during signup
-- Run this in Supabase SQL Editor

-- Step 1: Drop ALL existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON users';
    END LOOP;
    RAISE NOTICE '✅ Dropped all existing policies';
END $$;

-- Step 2: Create a more permissive INSERT policy
-- This allows authenticated users to insert their own record
CREATE POLICY "Users can insert own profile during signup"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Alternative: Even more permissive for testing (ONLY FOR DEVELOPMENT!)
-- Uncomment this if the above doesn't work:
-- CREATE POLICY "Allow authenticated users to insert"
-- ON users FOR INSERT
-- TO authenticated
-- WITH CHECK (true);

-- Step 3: Create SELECT policy
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Step 4: Create UPDATE policy  
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 5: Verify policies
SELECT 
    policyname, 
    cmd as operation,
    roles,
    with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd;

-- If this still doesn't work, try temporarily disabling RLS:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- (Only for testing, then re-enable it)

