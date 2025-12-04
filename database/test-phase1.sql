-- ============================================================================
-- Phase 1 Testing SQL Scripts
-- ============================================================================
-- Run these queries in Supabase SQL Editor to test Phase 1 implementations
-- ============================================================================

-- Test 1: Verify all new columns exist
-- ============================================================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN (
  'phone', 
  'linkedin_url', 
  'github_url', 
  'website_url', 
  'address',
  'preferred_industry',
  'degree_type',
  'work_experience',
  'education',
  'updated_at'
)
ORDER BY column_name;

-- Expected: Should return 10 rows

-- ============================================================================
-- Test 2: Check indexes were created
-- ============================================================================
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'users'
AND (
  indexname LIKE '%phone%' 
  OR indexname LIKE '%linkedin%'
  OR indexname LIKE '%preferred_industry%'
  OR indexname LIKE '%work_experience%'
  OR indexname LIKE '%education%'
  OR indexname LIKE '%degree_type%'
)
ORDER BY indexname;

-- Expected: Should show 5-6 indexes

-- ============================================================================
-- Test 3: Verify trigger exists
-- ============================================================================
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_name = 'update_users_updated_at';

-- Expected: Should return 1 row with trigger details

-- ============================================================================
-- Test 4: Test updated_at auto-update
-- ============================================================================
-- Step 1: Check current updated_at
SELECT 
  id,
  email,
  full_name,
  updated_at
FROM users
WHERE email = 'abhishekp1703@gmail.com'  -- Replace with your test email
LIMIT 1;

-- Step 2: Update a field (run this)
-- UPDATE users 
-- SET full_name = 'Test User Updated'
-- WHERE email = 'abhishekp1703@gmail.com';  -- Replace with your test email

-- Step 3: Check if updated_at changed (run after step 2)
-- SELECT 
--   id,
--   email,
--   full_name,
--   updated_at
-- FROM users
-- WHERE email = 'abhishekp1703@gmail.com';  -- Replace with your test email

-- Expected: updated_at should be different from step 1

-- ============================================================================
-- Test 5: Test inserting student profile data
-- ============================================================================
-- First, check if you have a student user (replace email)
SELECT 
  id,
  email,
  role,
  full_name
FROM users
WHERE email = 'your-student-email@example.com'  -- Replace with student email
AND role = 'student';

-- Then test updating with new fields (replace user_id with actual UUID)
-- UPDATE users
-- SET 
--   phone = '+1 (555) 123-4567',
--   linkedin_url = 'https://linkedin.com/in/testuser',
--   github_url = 'https://github.com/testuser',
--   website_url = 'https://testuser.com',
--   address = '123 Main St, College Station, TX 77840',
--   preferred_industry = 'Software',
--   degree_type = 'bachelor',
--   work_experience = '[
--     {
--       "id": "test-id-1",
--       "company": "Tech Corp",
--       "position": "Software Engineer Intern",
--       "start_date": "2024-01-01",
--       "end_date": "2024-06-30",
--       "description": "Developed web applications",
--       "is_current": false
--     }
--   ]'::jsonb,
--   education = '[
--     {
--       "id": "test-edu-1",
--       "institution": "Texas A&M University",
--       "degree": "Bachelor of Science",
--       "field_of_study": "Computer Science",
--       "start_date": "2020-09-01",
--       "end_date": "2024-05-15",
--       "gpa": 3.75,
--       "is_current": false
--     }
--   ]'::jsonb
-- WHERE id = 'your-user-uuid-here';  -- Replace with actual user ID

-- Verify the update
-- SELECT 
--   email,
--   phone,
--   linkedin_url,
--   github_url,
--   preferred_industry,
--   degree_type,
--   work_experience,
--   education,
--   updated_at
-- FROM users
-- WHERE id = 'your-user-uuid-here';  -- Replace with actual user ID

-- ============================================================================
-- Test 6: Verify JSONB structure
-- ============================================================================
-- Check work_experience structure
SELECT 
  email,
  jsonb_array_length(work_experience) as work_exp_count,
  work_experience
FROM users
WHERE work_experience IS NOT NULL 
AND jsonb_array_length(work_experience) > 0
LIMIT 5;

-- Check education structure
SELECT 
  email,
  jsonb_array_length(education) as education_count,
  education
FROM users
WHERE education IS NOT NULL 
AND jsonb_array_length(education) > 0
LIMIT 5;

-- ============================================================================
-- Test 7: Check role distribution
-- ============================================================================
SELECT 
  role,
  COUNT(*) as count
FROM users
GROUP BY role
ORDER BY count DESC;

-- Expected: Should show role distribution

-- ============================================================================
-- Test 8: Verify constraints
-- ============================================================================
-- Check degree_type constraint
SELECT 
  column_name,
  data_type,
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%degree_type%';

-- Expected: Should show the CHECK constraint for degree_type

-- ============================================================================
-- Test 9: Sample data query for student profile
-- ============================================================================
-- View complete student profile with all new fields
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.phone,
  u.linkedin_url,
  u.github_url,
  u.website_url,
  u.address,
  u.preferred_industry,
  u.degree_type,
  u.major,
  u.skills,
  u.graduation_year,
  u.gpa,
  u.work_experience,
  u.education,
  u.metadata,
  u.created_at,
  u.updated_at
FROM users u
WHERE u.role = 'student'
LIMIT 1;

-- ============================================================================
-- Test 10: Cleanup test data (optional)
-- ============================================================================
-- Remove test data if needed
-- UPDATE users
-- SET 
--   phone = NULL,
--   linkedin_url = NULL,
--   github_url = NULL,
--   website_url = NULL,
--   address = NULL,
--   preferred_industry = NULL,
--   degree_type = NULL,
--   work_experience = '[]'::jsonb,
--   education = '[]'::jsonb
-- WHERE email = 'test-email@example.com';

-- ============================================================================
-- Quick Verification Checklist
-- ============================================================================
-- Run these to verify everything is set up correctly:

-- 1. Columns exist?
SELECT COUNT(*) as new_columns_count
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('phone', 'linkedin_url', 'github_url', 'website_url', 'address', 'preferred_industry', 'degree_type', 'work_experience', 'education', 'updated_at');
-- Expected: 10

-- 2. Indexes exist?
SELECT COUNT(*) as index_count
FROM pg_indexes
WHERE tablename = 'users'
AND indexname LIKE '%phone%' OR indexname LIKE '%linkedin%' OR indexname LIKE '%preferred_industry%' OR indexname LIKE '%work_experience%' OR indexname LIKE '%education%';
-- Expected: 5-6

-- 3. Trigger exists?
SELECT COUNT(*) as trigger_count
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_name = 'update_users_updated_at';
-- Expected: 1

-- ============================================================================
-- End of Testing Scripts
-- ============================================================================

