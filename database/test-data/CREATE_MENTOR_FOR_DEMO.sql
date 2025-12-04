-- ============================================================================
-- CREATE MENTOR FOR DEMO - Easy Setup
-- ============================================================================
-- This script will automatically find a user and create a mentor profile
-- Run this in Supabase SQL Editor

-- Step 1: Find available users who can be mentors
-- ============================================================================
SELECT 
  id,
  email,
  full_name,
  role,
  'Use this UUID below' as instruction
FROM users 
WHERE role IN ('faculty', 'admin')
ORDER BY created_at DESC
LIMIT 5;

-- Step 2: Create mentor profile from first available user
-- ============================================================================
-- This will automatically use the first faculty/admin user found
-- Or you can manually specify a UUID below

DO $$
DECLARE
  v_user_id uuid;
  v_user_email text;
  v_user_name text;
BEGIN
  -- Find first available faculty or admin user
  SELECT id, email, full_name INTO v_user_id, v_user_email, v_user_name
  FROM users 
  WHERE role IN ('faculty', 'admin')
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Check if user was found
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No faculty or admin users found. Please create a user with role "faculty" or "admin" first.';
  END IF;
  
  -- Check if mentor profile already exists
  IF EXISTS (SELECT 1 FROM mentorship_profiles WHERE user_id = v_user_id AND profile_type = 'mentor') THEN
    RAISE NOTICE 'Mentor profile already exists for user: % (%)', v_user_email, v_user_id;
    RETURN;
  END IF;
  
  -- Create mentor profile
  INSERT INTO mentorship_profiles (
    user_id,
    profile_type,
    industry,
    areas_of_expertise,
    max_mentees,
    availability_status,
    in_matching_pool,
    preferred_name,
    contact_email,
    organization,
    job_designation
  ) VALUES (
    v_user_id,
    'mentor',
    'Technology',
    ARRAY['Software Engineering', 'Machine Learning', 'Web Development', 'Data Science', 'Cloud Computing'],
    5,
    'active',
    true,
    COALESCE(v_user_name, 'Mentor'),
    v_user_email,
    'CMIS',
    'Faculty/Advisor'
  );
  
  RAISE NOTICE '✅ Successfully created mentor profile for: % (%)', v_user_email, v_user_id;
  RAISE NOTICE 'Mentor is now available in the matching pool!';
  
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE 'Mentor profile already exists for this user.';
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating mentor profile: %', SQLERRM;
END $$;

-- Step 3: Verify mentor was created
-- ============================================================================
SELECT 
  '✅ Mentor Created!' as status,
  u.email,
  u.full_name,
  mp.industry,
  mp.areas_of_expertise,
  mp.availability_status,
  mp.in_matching_pool,
  mp.max_mentees
FROM mentorship_profiles mp
JOIN users u ON mp.user_id = u.id
WHERE mp.profile_type = 'mentor'
ORDER BY mp.created_at DESC
LIMIT 1;

-- ============================================================================
-- ALTERNATIVE: Manual creation (if automatic doesn't work)
-- ============================================================================
-- If the automatic script above doesn't work, you can manually create a mentor:
-- 
-- 1. First, run this to get a user UUID:
--    SELECT id, email, role FROM users WHERE role IN ('faculty', 'admin') LIMIT 1;
--
-- 2. Then replace YOUR_USER_UUID_HERE with the actual UUID and run:
--
-- INSERT INTO mentorship_profiles (
--   user_id,
--   profile_type,
--   industry,
--   areas_of_expertise,
--   max_mentees,
--   availability_status,
--   in_matching_pool,
--   preferred_name,
--   contact_email
-- ) 
-- VALUES (
--   'YOUR_USER_UUID_HERE'::uuid,  -- Replace with actual UUID
--   'mentor',
--   'Technology',
--   ARRAY['Software Engineering', 'Machine Learning', 'Web Development'],
--   5,
--   'active',
--   true,
--   'Demo Mentor',
--   'mentor@example.com'
-- );

