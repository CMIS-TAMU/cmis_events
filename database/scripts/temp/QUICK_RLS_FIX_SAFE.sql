-- SAFE RLS FIX: This handles existing policies gracefully
-- Run this in Supabase SQL Editor - safe to run multiple times

-- Step 1: Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies (using DO block for safety)
DO $$
BEGIN
    -- Drop all existing policies on users table
    DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON users;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
    DROP POLICY IF EXISTS "Users can view own profile" ON users;
    DROP POLICY IF EXISTS "Users can view their own profile" ON users;
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    DROP POLICY IF EXISTS "Users can update their own profile" ON users;
    DROP POLICY IF EXISTS "Public can insert during signup" ON users;
    DROP POLICY IF EXISTS "Admins can view all users" ON users;
    DROP POLICY IF EXISTS "Admins can update all users" ON users;
    
    RAISE NOTICE '✅ Dropped all existing policies';
END $$;

-- Step 3: Create the INSERT policy (THE FIX!)
CREATE POLICY IF NOT EXISTS "Authenticated users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Step 4: Create SELECT policy
CREATE POLICY IF NOT EXISTS "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Step 5: Create UPDATE policy
CREATE POLICY IF NOT EXISTS "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 6: Verify policies
SELECT 
    policyname, 
    cmd as operation,
    '✅ Created' as status
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd;

-- ✅ All done! Try creating a user account now.

