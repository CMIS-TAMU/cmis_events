-- ============================================================================
-- SIMPLE MANUAL SETUP: Create Users from Auth User UUIDs
-- ============================================================================
-- Use this AFTER creating auth users manually in Supabase Auth UI
-- 
-- STEPS:
-- 1. Create auth users in Supabase Dashboard → Authentication → Users
-- 2. Copy each user's UUID from Supabase
-- 3. Replace the UUIDs below with the actual auth user UUIDs
-- 4. Run this script to create/update users in the users table
-- ============================================================================

-- ============================================================================
-- STEP 1: Replace UUIDs below with actual auth user UUIDs from Supabase
-- ============================================================================
-- Get UUIDs from: Supabase Dashboard → Authentication → Users → Click user → Copy UUID

-- ============================================================================
-- STEP 2: Create/Update Users in users table
-- ============================================================================

-- Student 1
INSERT INTO users (id, email, full_name, role, major, skills, graduation_year, metadata)
VALUES (
  '5c4687b6-eb16-4cb7-888a-d233c08c6582', -- abhishektest@gmail.com
  'abhishektest@gmail.com',
  'Test Student One',
  'student',
  'Computer Science',
  ARRAY['Python', 'JavaScript', 'React', 'Node.js'],
  2025,
  '{"career_goals": "Software Engineering", "research_interests": ["Machine Learning", "Web Development"], "location": "College Station, TX", "communication_preferences": ["email", "virtual"]}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  major = EXCLUDED.major,
  skills = EXCLUDED.skills,
  graduation_year = EXCLUDED.graduation_year,
  metadata = EXCLUDED.metadata;

-- Student 2
INSERT INTO users (id, email, full_name, role, major, skills, graduation_year, metadata)
VALUES (
  'bca5aa11-3faa-470c-a8f3-3f19aba5f809', -- abhishektest2@gmail.com
  'abhishektest2@gmail.com',
  'Test Student Two',
  'student',
  'Electrical Engineering',
  ARRAY['Circuit Design', 'Embedded Systems', 'C++'],
  2026,
  '{"career_goals": "Hardware Engineering", "research_interests": ["IoT", "Robotics"], "location": "College Station, TX", "communication_preferences": ["in-person", "phone"]}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  major = EXCLUDED.major,
  skills = EXCLUDED.skills,
  graduation_year = EXCLUDED.graduation_year,
  metadata = EXCLUDED.metadata;

-- Mentor 1
INSERT INTO users (id, email, full_name, role)
VALUES (
  'da62bb8b-0259-4a17-9826-791938a21536', -- abhishekmentor1@gmail.com
  'abhishekmentor1@gmail.com',
  'Test Mentor One',
  'faculty'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Mentor 2
INSERT INTO users (id, email, full_name, role)
VALUES (
  '7bb86ed6-d48e-4173-ab53-4070d672c58b', -- abhishekmentor2@gmail.com
  'abhishekmentor2@gmail.com',
  'Test Mentor Two',
  'faculty'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Mentor 3
INSERT INTO users (id, email, full_name, role)
VALUES (
  '2b27296a-a6e5-4d9e-b69a-374be92d9d1e', -- abhishekmentor3@gmail.com
  'abhishekmentor3@gmail.com',
  'Test Mentor Three',
  'faculty'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- ============================================================================
-- STEP 3: Create Mentor Profiles (using the same UUIDs)
-- ============================================================================

-- Mentor 1 Profile: Software Engineering
INSERT INTO mentorship_profiles (
  user_id,
  profile_type,
  industry,
  areas_of_expertise,
  max_mentees,
  current_mentees,
  availability_status,
  in_matching_pool,
  location,
  communication_preferences
)
VALUES (
  'da62bb8b-0259-4a17-9826-791938a21536', -- abhishekmentor1@gmail.com
  'mentor',
  'Software Engineering',
  ARRAY['Machine Learning', 'Web Development', 'React', 'Node.js', 'Python'],
  3,
  0,
  'active',
  true,
  'College Station, TX',
  ARRAY['virtual', 'email']
)
ON CONFLICT (user_id, profile_type) DO UPDATE SET
  industry = EXCLUDED.industry,
  areas_of_expertise = EXCLUDED.areas_of_expertise,
  availability_status = 'active',
  in_matching_pool = true;

-- Mentor 2 Profile: Hardware Engineering
INSERT INTO mentorship_profiles (
  user_id,
  profile_type,
  industry,
  areas_of_expertise,
  max_mentees,
  current_mentees,
  availability_status,
  in_matching_pool,
  location,
  communication_preferences
)
VALUES (
  '7bb86ed6-d48e-4173-ab53-4070d672c58b', -- abhishekmentor2@gmail.com
  'mentor',
  'Hardware Engineering',
  ARRAY['IoT', 'Robotics', 'Circuit Design', 'Embedded Systems'],
  2,
  0,
  'active',
  true,
  'College Station, TX',
  ARRAY['in-person', 'virtual']
)
ON CONFLICT (user_id, profile_type) DO UPDATE SET
  industry = EXCLUDED.industry,
  areas_of_expertise = EXCLUDED.areas_of_expertise,
  availability_status = 'active',
  in_matching_pool = true;

-- Mentor 3 Profile: General Tech
INSERT INTO mentorship_profiles (
  user_id,
  profile_type,
  industry,
  areas_of_expertise,
  max_mentees,
  current_mentees,
  availability_status,
  in_matching_pool,
  location,
  communication_preferences
)
VALUES (
  '2b27296a-a6e5-4d9e-b69a-374be92d9d1e', -- abhishekmentor3@gmail.com
  'mentor',
  'Technology',
  ARRAY['Career Development', 'Interview Prep', 'Technical Skills'],
  5,
  0,
  'active',
  true,
  'Remote',
  ARRAY['virtual', 'email', 'phone']
)
ON CONFLICT (user_id, profile_type) DO UPDATE SET
  industry = EXCLUDED.industry,
  areas_of_expertise = EXCLUDED.areas_of_expertise,
  availability_status = 'active',
  in_matching_pool = true;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that all users were created correctly
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  CASE 
    WHEN u.id::text LIKE '%-%-%-%-%' THEN '✅ Valid UUID'
    ELSE '⚠️  Check UUID format'
  END as uuid_status
FROM users u
WHERE u.email IN (
  'abhishektest@gmail.com',
  'abhishektest2@gmail.com',
  'abhishekmentor1@gmail.com',
  'abhishekmentor2@gmail.com',
  'abhishekmentor3@gmail.com'
)
ORDER BY u.email;

