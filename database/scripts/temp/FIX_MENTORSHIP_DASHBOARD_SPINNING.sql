-- ============================================================================
-- FIX: Mentorship Dashboard Spinning Issue
-- ============================================================================
-- Run these queries to diagnose and fix the spinning dashboard

-- Step 1: Check if queries can run (test basic queries)
-- ============================================================================

-- Test 1: Can we query match_batches?
SELECT COUNT(*) as batch_count FROM match_batches;

-- Test 2: Can we query matches?
SELECT COUNT(*) as match_count FROM matches;

-- Test 3: Can we query users?
SELECT COUNT(*) as user_count FROM users WHERE role = 'student';

-- Step 2: Clear any problematic pending batches
-- ============================================================================

-- Clear expired batches
UPDATE match_batches
SET status = 'expired'
WHERE status = 'pending' AND expires_at < NOW();

-- Delete very old expired batches
DELETE FROM match_batches
WHERE status = 'expired' AND expires_at < NOW() - INTERVAL '7 days';

-- Step 3: Check RLS policies (might be blocking queries)
-- ============================================================================

-- Check if RLS is enabled on tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('match_batches', 'matches', 'mentorship_profiles')
ORDER BY tablename;

-- Step 4: Verify mentors exist (critical!)
-- ============================================================================

SELECT 
  'Mentors available' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ NO MENTORS - Create one first!'
    ELSE '✅ Mentors available'
  END as status
FROM mentorship_profiles
WHERE profile_type = 'mentor'
  AND in_matching_pool = true
  AND availability_status = 'active';

-- Step 5: Check for any locks or blocking queries
-- ============================================================================

SELECT 
  pid,
  usename,
  application_name,
  state,
  query_start,
  state_change,
  wait_event_type,
  wait_event,
  query
FROM pg_stat_activity
WHERE datname = current_database()
  AND state != 'idle'
  AND query NOT LIKE '%pg_stat_activity%'
ORDER BY query_start;

-- Step 6: Force clear ALL pending batches (for testing)
-- ============================================================================
-- Uncomment to run:

/*
-- WARNING: This will delete all pending batches
-- Only use for testing/demo purposes!

DELETE FROM match_batches WHERE status = 'pending';

-- Or just mark them as expired
UPDATE match_batches SET status = 'expired' WHERE status = 'pending';
*/

-- ============================================================================
-- COMMON FIXES:
-- ============================================================================

-- Fix 1: If no mentors exist, create one (see CREATE_MENTOR_SIMPLE.sql)

-- Fix 2: If RLS is blocking, check RLS policies in Supabase:
--   - Go to Authentication > Policies
--   - Check match_batches table policies
--   - Ensure authenticated users can SELECT their own batches

-- Fix 3: If queries are slow, add indexes:
/*
CREATE INDEX IF NOT EXISTS idx_match_batches_student_id 
ON match_batches(student_id);

CREATE INDEX IF NOT EXISTS idx_match_batches_status 
ON match_batches(status);

CREATE INDEX IF NOT EXISTS idx_matches_user_id 
ON matches(student_id, mentor_id);
*/

