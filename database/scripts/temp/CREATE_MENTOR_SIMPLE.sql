-- ============================================================================
-- SIMPLE: Create Mentor for Demo
-- ============================================================================
-- Run this in Supabase SQL Editor - it will automatically create a mentor

-- Step 1: Show available users (run this first to see who can be a mentor)
SELECT 
  id,
  email,
  full_name,
  role
FROM users 
WHERE role IN ('faculty', 'admin')
ORDER BY created_at DESC;

-- Step 2: Create mentor automatically (run this after Step 1)
-- ============================================================================
DO $$
DECLARE
  v_user_id uuid;
  v_user_email text;
  v_user_name text;
BEGIN
  -- Find first faculty or admin user
  SELECT id, email, COALESCE(full_name, email) 
  INTO v_user_id, v_user_email, v_user_name
  FROM users 
  WHERE role IN ('faculty', 'admin')
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No faculty or admin users found. Please create a user with role "faculty" first.';
  END IF;
  
  -- Insert mentor profile (ignore if already exists)
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
  ) VALUES (
    v_user_id,
    'mentor',
    'Technology',
    ARRAY['Software Engineering', 'Machine Learning', 'Web Development'],
    5,
    'active',
    true,
    v_user_name,
    v_user_email
  )
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE '✅ Mentor created for: % (%)', v_user_email, v_user_id;
END $$;

-- Step 3: Verify it worked
SELECT 
  u.email,
  u.full_name,
  mp.industry,
  mp.areas_of_expertise,
  mp.availability_status,
  mp.in_matching_pool
FROM mentorship_profiles mp
JOIN users u ON mp.user_id = u.id
WHERE mp.profile_type = 'mentor'
ORDER BY mp.created_at DESC;

