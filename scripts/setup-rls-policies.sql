-- Row-Level Security (RLS) Policies Setup
-- Run this AFTER running the master migration
-- This ensures proper access control for new tables

-- ============================================================================
-- RESUME VIEWS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE resume_views ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own resume views (when they're the resume owner or viewer)
CREATE POLICY "Users can view own resume views"
ON resume_views FOR SELECT
USING (user_id = auth.uid() OR viewed_by = auth.uid());

-- Policy: Authenticated users can track resume views (for analytics)
CREATE POLICY "Authenticated users can track views"
ON resume_views FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Admins and sponsors can view all resume views (for analytics)
CREATE POLICY "Admins and sponsors can view all resume views"
ON resume_views FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'sponsor')
  )
);

-- ============================================================================
-- SESSION REGISTRATIONS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE session_registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can register for sessions
CREATE POLICY "Authenticated users can register for sessions"
ON session_registrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own session registrations
CREATE POLICY "Users can view own session registrations"
ON session_registrations FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can delete their own session registrations (cancel)
CREATE POLICY "Users can cancel own session registrations"
ON session_registrations FOR DELETE
USING (auth.uid() = user_id);

-- Policy: Admins can view all session registrations
CREATE POLICY "Admins can view all session registrations"
ON session_registrations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify RLS is enabled
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('resume_views', 'session_registrations');

-- Count policies
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('resume_views', 'session_registrations')
GROUP BY tablename;

