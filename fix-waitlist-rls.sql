-- ============================================
-- Fix Waitlist RLS Policies
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Enable RLS on waitlist table (if not already enabled)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert into waitlist" ON waitlist;
DROP POLICY IF EXISTS "Users can view own waitlist entries" ON waitlist;
DROP POLICY IF EXISTS "Users can delete own waitlist entries" ON waitlist;
DROP POLICY IF EXISTS "Admins can view all waitlist" ON waitlist;
DROP POLICY IF EXISTS "Admins can manage waitlist" ON waitlist;

-- Step 3: Allow authenticated users to insert their own waitlist entry
CREATE POLICY "Users can insert into waitlist"
ON waitlist FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Step 4: Allow users to view their own waitlist entries
CREATE POLICY "Users can view own waitlist entries"
ON waitlist FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Step 5: Allow users to delete their own waitlist entries (for cancellation)
CREATE POLICY "Users can delete own waitlist entries"
ON waitlist FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 6: Allow admins to view all waitlist entries
CREATE POLICY "Admins can view all waitlist"
ON waitlist FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Step 7: Allow admins to manage waitlist (for promoting users)
CREATE POLICY "Admins can manage waitlist"
ON waitlist FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- ============================================
-- Also Fix Event Registrations RLS (Recommended)
-- ============================================

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own registration" ON event_registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can update own registration" ON event_registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON event_registrations;
DROP POLICY IF EXISTS "Admins can manage registrations" ON event_registrations;

-- Allow users to insert their own registrations
CREATE POLICY "Users can insert own registration"
ON event_registrations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own registrations
CREATE POLICY "Users can view own registrations"
ON event_registrations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own registrations (for cancellation)
CREATE POLICY "Users can update own registration"
ON event_registrations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all registrations
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

-- Allow admins to manage all registrations
CREATE POLICY "Admins can manage registrations"
ON event_registrations FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- ============================================
-- Verify Policies Were Created
-- ============================================

-- Check waitlist policies
SELECT 
    'waitlist' as table_name,
    policyname, 
    cmd as operation,
    '✅ Created' as status
FROM pg_policies
WHERE tablename = 'waitlist'
ORDER BY cmd;

-- Check event_registrations policies
SELECT 
    'event_registrations' as table_name,
    policyname, 
    cmd as operation,
    '✅ Created' as status
FROM pg_policies
WHERE tablename = 'event_registrations'
ORDER BY cmd;

-- ✅ All done! Try registering for an event now.

