-- Fix RLS Policy for Events Table
-- This allows admins to create, update, and delete events
-- Run this in Supabase SQL Editor

-- First, check if RLS is enabled
-- ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (optional - will error if they don't exist)
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Public can view events" ON events;
DROP POLICY IF EXISTS "Users can view events" ON events;

-- Policy: Everyone can view events (public read access)
CREATE POLICY "Public can view events"
ON events FOR SELECT
USING (true);

-- Policy: Admins can insert events
CREATE POLICY "Admins can insert events"
ON events FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Policy: Admins can update events
CREATE POLICY "Admins can update events"
ON events FOR UPDATE
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

-- Policy: Admins can delete events
CREATE POLICY "Admins can delete events"
ON events FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'events'
ORDER BY policyname;


