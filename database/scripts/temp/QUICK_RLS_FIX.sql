-- QUICK FIX: Run this in Supabase SQL Editor to fix RLS policy error
-- Copy and paste the entire block below into Supabase SQL Editor and click "Run"
-- This script is safe to run multiple times - it will drop and recreate policies

-- Step 1: Enable RLS (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies on users table (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Public can insert during signup" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Step 3: Create the INSERT policy (THIS IS THE FIX!)
CREATE POLICY "Authenticated users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Step 4: Create other necessary policies
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 5: Verify it worked
SELECT 
    policyname, 
    cmd as operation
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd;

-- ✅ Done! You should see 3 policies listed (INSERT, SELECT, UPDATE)
-- Now try creating a user account again!

