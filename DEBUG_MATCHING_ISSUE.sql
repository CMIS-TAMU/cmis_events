-- ============================================================================
-- DEBUG MATCHING ISSUE
-- Purpose: Check why matching is hanging or failing
-- ============================================================================

-- 1. Check if student exists and has data
SELECT 
  id,
  email,
  role,
  major,
  skills,
  graduation_year,
  resume_url
FROM users
WHERE email = 'abhishek.patil@tamu.edu';

-- 2. Check if mentors exist and are ready
SELECT 
  mp.id,
  mp.user_id,
  mp.profile_type,
  mp.industry,
  mp.areas_of_expertise,
  mp.in_matching_pool,
  mp.availability_status,
  mp.current_mentees,
  mp.max_mentees,
  u.email,
  u.full_name
FROM mentorship_profiles mp
JOIN users u ON u.id = mp.user_id
WHERE mp.profile_type = 'mentor'
  AND mp.in_matching_pool = true
  AND mp.availability_status = 'active'
  AND mp.current_mentees < mp.max_mentees;

-- 3. Check if find_top_mentors function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'find_top_mentors';

-- 4. Check if create_match_batch function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_match_batch';

-- 5. Test find_top_mentors function manually (replace student_id)
-- Get student_id first:
SELECT id FROM users WHERE email = 'abhishek.patil@tamu.edu';

-- Then test (replace <student_id> with actual UUID):
-- SELECT * FROM find_top_mentors('<student_id>'::uuid, 3);

-- 6. Check for any pending match batches
SELECT 
  mb.*,
  u.email as student_email
FROM match_batches mb
JOIN users u ON u.id = mb.student_id
WHERE u.email = 'abhishek.patil@tamu.edu';

-- 7. Check recent match batches for errors
SELECT 
  mb.id,
  mb.student_id,
  mb.status,
  mb.created_at,
  u.email as student_email
FROM match_batches mb
JOIN users u ON u.id = mb.student_id
ORDER BY mb.created_at DESC
LIMIT 5;

-- ============================================================================
-- QUICK FIX: Check if migration was run
-- ============================================================================

-- Check if the updated functions exist:
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('find_top_mentors', 'create_match_batch', 'calculate_match_score')
ORDER BY routine_name;

