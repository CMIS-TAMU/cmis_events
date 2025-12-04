-- ============================================================================
-- QUICK DIAGNOSIS: Why is mentorship request spinning?
-- ============================================================================
-- Run these queries in Supabase SQL Editor to diagnose the issue

-- 1. Check if ANY mentors exist (most likely issue!)
SELECT 
  'Total mentors' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ NO MENTORS - THIS IS LIKELY THE PROBLEM!'
    ELSE '✅ Mentors exist'
  END as status
FROM mentorship_profiles
WHERE profile_type = 'mentor';

-- 2. Check if mentors are available for matching
SELECT 
  'Available mentors' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ NO AVAILABLE MENTORS - NEED TO FIX!'
    ELSE '✅ Available mentors found'
  END as status
FROM mentorship_profiles
WHERE profile_type = 'mentor'
  AND in_matching_pool = true
  AND availability_status = 'active';

-- 3. List all mentors with their status
SELECT 
  u.email,
  u.full_name,
  mp.availability_status,
  mp.in_matching_pool,
  mp.max_mentees,
  COALESCE(mp.current_mentees, 0) as current_mentees,
  CASE 
    WHEN mp.in_matching_pool = false THEN '❌ Not in matching pool'
    WHEN mp.availability_status != 'active' THEN '❌ Not active'
    WHEN COALESCE(mp.current_mentees, 0) >= mp.max_mentees THEN '❌ At capacity'
    ELSE '✅ Available'
  END as status
FROM mentorship_profiles mp
JOIN users u ON mp.user_id = u.id
WHERE mp.profile_type = 'mentor'
ORDER BY mp.created_at DESC;

-- 4. Check if find_top_mentors function exists
SELECT 
  'Function exists' as check_type,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ find_top_mentors function exists'
    ELSE '❌ FUNCTION MISSING - Need to run migration!'
  END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'find_top_mentors';

-- 5. Check if create_match_batch function exists
SELECT 
  'Function exists' as check_type,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ create_match_batch function exists'
    ELSE '❌ FUNCTION MISSING - Need to run migration!'
  END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'create_match_batch';

-- 6. Check for any pending match batches (might be blocking)
SELECT 
  'Pending batches' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) > 0 THEN '⚠️ Found pending batches - might need to clear'
    ELSE '✅ No blocking batches'
  END as status
FROM match_batches
WHERE status = 'pending' AND expires_at > NOW();

-- 7. List pending batches with student info
SELECT 
  mb.id,
  u.email as student_email,
  mb.status,
  mb.created_at,
  mb.expires_at,
  CASE 
    WHEN mb.expires_at < NOW() THEN '⚠️ EXPIRED'
    ELSE 'Active'
  END as expiration_status
FROM match_batches mb
JOIN users u ON mb.student_id = u.id
WHERE mb.status = 'pending'
ORDER BY mb.created_at DESC;

-- 8. Get a student user ID to test with (replace email with your student email)
-- SELECT id, email, role, major, skills 
-- FROM users 
-- WHERE role = 'student' AND email = 'YOUR_STUDENT_EMAIL@example.com';

-- 9. Test find_top_mentors function (uncomment and replace STUDENT_UUID)
-- SELECT * FROM find_top_mentors('STUDENT_UUID', 1);

-- ============================================================================
-- MOST LIKELY ISSUE: No mentors in database
-- ============================================================================
-- If query #1 or #2 returns 0, you need to create a mentor first!

-- Quick fix: Create a test mentor
-- (Replace USER_ID with an actual user who should be a mentor)

/*
INSERT INTO mentorship_profiles (
  user_id,
  profile_type,
  industry,
  areas_of_expertise,
  max_mentees,
  availability_status,
  in_matching_pool,
  preferred_name,
  contact_email
) 
SELECT 
  u.id,
  'mentor',
  'Technology',
  ARRAY['Software Engineering', 'Machine Learning', 'Web Development'],
  5,
  'active',
  true,
  u.full_name,
  u.email
FROM users u
WHERE u.role = 'faculty' OR u.role = 'admin'
LIMIT 1
ON CONFLICT DO NOTHING;
*/

