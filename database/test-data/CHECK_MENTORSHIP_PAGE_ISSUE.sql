-- ============================================================================
-- QUICK CHECK: Why is mentorship page spinning?
-- ============================================================================
-- Run these queries to diagnose the issue

-- 1. Check if there are any blocking match batches
SELECT 
  'Pending batches' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) > 0 THEN '⚠️ Found pending batches - might be blocking'
    ELSE '✅ No blocking batches'
  END as status
FROM match_batches
WHERE status = 'pending' AND expires_at > NOW();

-- 2. Check if user has a problematic match batch
-- (Replace USER_EMAIL with your student email)
SELECT 
  mb.id,
  mb.status,
  mb.created_at,
  mb.expires_at,
  CASE 
    WHEN mb.expires_at < NOW() THEN '⚠️ EXPIRED but still pending'
    ELSE 'Active'
  END as expiration_status
FROM match_batches mb
JOIN users u ON mb.student_id = u.id
WHERE u.email = 'USER_EMAIL'  -- Replace with your email
ORDER BY mb.created_at DESC;

-- 3. Check if there are any database function errors
-- Look for errors in Supabase logs related to:
-- - create_match_batch
-- - find_top_mentors
-- - calculate_match_score

-- 4. Quick fix: Clear ALL pending/expired batches
-- (Uncomment to run)
/*
UPDATE match_batches
SET status = 'expired'
WHERE status = 'pending' AND expires_at < NOW();

DELETE FROM match_batches
WHERE status = 'expired' AND expires_at < NOW() - INTERVAL '1 day';
*/

-- 5. Check if mentor exists (most common issue)
SELECT 
  'Available mentors' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ NO MENTORS - This is the problem!'
    ELSE '✅ Mentors available'
  END as status
FROM mentorship_profiles
WHERE profile_type = 'mentor'
  AND in_matching_pool = true
  AND availability_status = 'active';

