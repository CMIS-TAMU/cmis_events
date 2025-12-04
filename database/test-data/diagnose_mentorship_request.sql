-- ============================================================================
-- DIAGNOSIS SCRIPT: Mentorship Request Flow
-- ============================================================================
-- Run this in Supabase SQL Editor to diagnose issues with mentor matching

-- 1. Check if create_match_batch function exists and its signature
SELECT 
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS arguments,
  pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'create_match_batch';

-- 2. Check current function definition (look for student profile requirement)
SELECT 
  p.proname AS function_name,
  CASE 
    WHEN pg_get_functiondef(p.oid) LIKE '%mentorship_profiles%profile_type%student%' 
      THEN 'REQUIRES STUDENT PROFILE (OLD VERSION - NEEDS UPDATE)'
    WHEN pg_get_functiondef(p.oid) LIKE '%users%role%student%' 
      THEN 'USES USERS TABLE (CORRECT VERSION)'
    ELSE 'UNKNOWN VERSION'
  END AS version_check
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'create_match_batch';

-- 3. Check if mentors exist in the database
SELECT 
  COUNT(*) AS total_mentors,
  COUNT(CASE WHEN in_matching_pool = true THEN 1 END) AS in_matching_pool,
  COUNT(CASE WHEN availability_status = 'active' THEN 1 END) AS active_mentors,
  COUNT(CASE WHEN in_matching_pool = true AND availability_status = 'active' THEN 1 END) AS available_mentors
FROM mentorship_profiles
WHERE profile_type = 'mentor';

-- 4. List available mentors with their details
SELECT 
  mp.id,
  u.email,
  u.full_name,
  mp.industry,
  mp.areas_of_expertise,
  mp.max_mentees,
  mp.availability_status,
  mp.in_matching_pool,
  (SELECT COUNT(*) FROM matches WHERE mentor_id = mp.user_id AND status = 'active') AS current_mentees
FROM mentorship_profiles mp
JOIN users u ON mp.user_id = u.id
WHERE mp.profile_type = 'mentor'
  AND mp.in_matching_pool = true
  AND mp.availability_status = 'active'
ORDER BY u.full_name;

-- 5. Check for any pending match batches
SELECT 
  mb.id,
  mb.student_id,
  u.email AS student_email,
  mb.status,
  mb.created_at,
  mb.expires_at,
  CASE 
    WHEN mb.expires_at < NOW() THEN 'EXPIRED'
    ELSE 'ACTIVE'
  END AS expiration_status
FROM match_batches mb
JOIN users u ON mb.student_id = u.id
WHERE mb.status = 'pending'
ORDER BY mb.created_at DESC;

-- 6. Check student data (replace 'YOUR_STUDENT_EMAIL' with actual email)
SELECT 
  id,
  email,
  full_name,
  role,
  major,
  skills,
  resume_url,
  metadata
FROM users
WHERE role = 'student'
  AND email = 'YOUR_STUDENT_EMAIL'; -- Replace with actual email

-- 7. Test calculate_match_score function (replace UUIDs with actual values)
-- SELECT calculate_match_score('STUDENT_UUID', 'MENTOR_USER_UUID');

-- 8. Test find_top_mentors function (replace UUID with actual student ID)
-- SELECT * FROM find_top_mentors('STUDENT_UUID', 1);

-- 9. Check mentorship_requests table
SELECT 
  mr.id,
  u.email AS student_email,
  mr.status,
  mr.match_batch_id,
  mr.created_at
FROM mentorship_requests mr
JOIN users u ON mr.student_id = u.id
ORDER BY mr.created_at DESC
LIMIT 10;

-- 10. Check active matches
SELECT 
  m.id,
  student.email AS student_email,
  mentor.email AS mentor_email,
  m.status,
  m.matched_at
FROM matches m
JOIN users student ON m.student_id = student.id
JOIN users mentor ON m.mentor_id = mentor.id
WHERE m.status = 'active'
ORDER BY m.matched_at DESC;

