-- ============================================
-- Fix Event Registrations RLS Policies
-- ============================================
-- This fixes the error: "new row violates row-level security policy for table 'event_registrations'"
-- Run this in Supabase SQL Editor

-- Step 1: Enable RLS on event_registrations table (if not already enabled)
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert own registration" ON event_registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can update own registration" ON event_registrations;
DROP POLICY IF EXISTS "Users can delete own registration" ON event_registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON event_registrations;
DROP POLICY IF EXISTS "Admins can manage all registrations" ON event_registrations;

-- Step 3: Allow authenticated users to insert their own registrations
-- This is the critical fix - allows users to register for events
CREATE POLICY "Users can insert own registration"
ON event_registrations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Step 4: Allow users to view their own registrations
CREATE POLICY "Users can view own registrations"
ON event_registrations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Step 5: Allow users to update their own registrations (for cancellation, status changes)
CREATE POLICY "Users can update own registration"
ON event_registrations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 6: Allow users to delete their own registrations (for cancellation)
CREATE POLICY "Users can delete own registration"
ON event_registrations FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 7: Allow admins to view all registrations
CREATE POLICY "Admins can view all registrations"
ON event_registrations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Step 8: Allow admins to manage all registrations
CREATE POLICY "Admins can manage all registrations"
ON event_registrations FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Step 9: Verify policies were created
SELECT 
    policyname, 
    cmd as operation,
    '✅ Created' as status
FROM pg_policies
WHERE tablename = 'event_registrations'
ORDER BY cmd;

-- Step 11: Verify RLS is enabled
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'event_registrations';

-- ✅ All done! Event registration should work now.

