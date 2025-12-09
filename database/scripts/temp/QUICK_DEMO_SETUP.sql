-- ============================================================================
-- QUICK DEMO SETUP SCRIPT
-- Purpose: Create a mentor profile for demonstration purposes
-- ============================================================================

-- STEP 1: Ensure mentor user exists and has correct role
-- Replace 'demo-mentor@example.com' with your mentor email
UPDATE users 
SET 
  role = 'faculty',
  full_name = COALESCE(full_name, 'Demo Mentor')
WHERE email = 'abhishekp1703@gmail.com';

-- STEP 2: Create or update mentor profile
-- Replace 'demo-mentor@example.com' with your mentor email
INSERT INTO mentorship_profiles (
  user_id,
  profile_type,
  industry,
  areas_of_expertise,
  max_mentees,
  current_mentees,
  in_matching_pool,
  availability_status,
  organization,
  job_designation,
  location,
  bio,
  tamu_graduation_year,
  preferred_name,
  contact_email,
  communication_preferences,
  meeting_frequency,
  mentorship_type
) VALUES (
  (SELECT id FROM users WHERE email = 'abhishekp1703@gmail.com'),
  'mentor',
  'Software Engineering',  -- Change to match your demo scenario
  ARRAY['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'Web Development'],  -- Adjust skills
  5,  -- Maximum mentees
  0,  -- Current mentees
  true,  -- ✅ IN MATCHING POOL (IMPORTANT!)
  'active',  -- ✅ ACTIVE STATUS (IMPORTANT!)
  'Tech Company',  -- Change as needed
  'Senior Software Engineer',  -- Change as needed
  'College Station, TX',  -- Change as needed
  'Experienced software engineer with 10+ years of experience in web development, specializing in modern JavaScript frameworks and full-stack development.',
  2010,  -- TAMU graduation year (optional)
  'Demo Mentor',  -- Preferred name
  (SELECT email FROM users WHERE email = 'abhishekp1703@gmail.com'),  -- Contact email
  ARRAY['email', 'virtual-meeting'],  -- Communication preferences
  'biweekly',  -- Meeting frequency
  'career'  -- Mentorship type
)
ON CONFLICT (user_id, profile_type) 
DO UPDATE SET
  industry = EXCLUDED.industry,
  areas_of_expertise = EXCLUDED.areas_of_expertise,
  max_mentees = EXCLUDED.max_mentees,
  current_mentees = 0,  -- Reset to 0 for demo
  in_matching_pool = true,  -- ✅ Ensure in matching pool
  availability_status = 'active',  -- ✅ Ensure active
  organization = EXCLUDED.organization,
  job_designation = EXCLUDED.job_designation,
  location = EXCLUDED.location,
  bio = EXCLUDED.bio;

-- STEP 3: Verify the mentor profile was created correctly
SELECT 
  u.email as mentor_email,
  u.full_name as mentor_name,
  u.role,
  mp.profile_type,
  mp.industry,
  mp.areas_of_expertise,
  mp.in_matching_pool,
  mp.availability_status,
  mp.current_mentees || '/' || mp.max_mentees as capacity,
  mp.organization,
  mp.job_designation
FROM mentorship_profiles mp
JOIN users u ON u.id = mp.user_id
WHERE mp.profile_type = 'mentor'
  AND u.email = 'abhishekp1703@gmail.com';

-- ============================================================================
-- OPTIONAL: Prepare a student account for matching
-- Replace 'student@example.com' with your student email
-- ============================================================================

-- Update student data for better matching
UPDATE users 
SET 
  role = 'student',
  major = 'Computer Science',  -- Should align with mentor's industry
  skills = ARRAY['JavaScript', 'React', 'Node.js'],  -- Should overlap with mentor expertise
  graduation_year = 2025,
  full_name = COALESCE(full_name, 'Demo Student')
WHERE email = 'abhishek.patil@tamu.edu'
  AND role = 'student';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check all mentors ready for matching
SELECT 
  u.email,
  u.full_name,
  mp.industry,
  mp.in_matching_pool,
  mp.availability_status,
  mp.current_mentees || '/' || mp.max_mentees as capacity
FROM mentorship_profiles mp
JOIN users u ON u.id = mp.user_id
WHERE mp.profile_type = 'mentor'
  AND mp.in_matching_pool = true
  AND mp.availability_status = 'active'
  AND mp.current_mentees < mp.max_mentees
ORDER BY u.email;

-- Check student profiles ready for matching
SELECT 
  email,
  full_name,
  major,
  skills,
  graduation_year
FROM users
WHERE role = 'student'
  AND (major IS NOT NULL OR skills IS NOT NULL OR resume_url IS NOT NULL)
ORDER BY email;

-- ============================================================================
-- TROUBLESHOOTING: Reset mentor for demo
-- ============================================================================

-- If you need to reset a mentor's status for demo:
UPDATE mentorship_profiles 
SET 
  current_mentees = 0,
  in_matching_pool = true,
  availability_status = 'active'
WHERE user_id = (SELECT id FROM users WHERE email = 'abhishekp1703@gmail.com')
  AND profile_type = 'mentor';

-- ============================================================================
-- NOTES:
-- 1. Replace 'demo-mentor@example.com' with your actual mentor email
-- 2. Replace 'student@example.com' with your actual student email
-- 3. Adjust industry, skills, and other fields to match your demo scenario
-- 4. Run this script in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- TROUBLESHOOTING: Clear pending match batch (if student already has one)
-- ============================================================================

-- If you get "Student already has a pending match batch" error:
-- Run this to clear the pending match batch:
DELETE FROM match_batches
WHERE student_id = (SELECT id FROM users WHERE email = 'abhishek.patil@tamu.edu')
  AND status = 'pending';

