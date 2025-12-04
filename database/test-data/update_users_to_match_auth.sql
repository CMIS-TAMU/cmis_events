-- ============================================================================
-- UPDATE USERS TABLE TO MATCH AUTH USER UUIDs
-- ============================================================================
-- After creating auth users manually in Supabase Auth UI, update the users
-- table to use the same UUIDs as the auth users.
-- 
-- INSTRUCTIONS:
-- 1. Create auth users in Supabase Auth UI (see MANUAL_AUTH_USER_SETUP.md)
-- 2. Copy the UUID for each auth user from Supabase Dashboard
-- 3. Replace the placeholder UUIDs below with the actual auth user UUIDs
-- 4. Run this script in Supabase SQL Editor
-- ============================================================================

-- ⚠️ WARNING: This will break existing relationships!
-- After running this, you may need to:
-- - Delete existing mentorship_profiles
-- - Delete existing matches
-- - Re-run parts of the test data script

-- ============================================================================
-- STEP 1: Replace UUIDs below with actual auth user UUIDs
-- ============================================================================

-- Get auth user UUIDs first (run this in SQL Editor to see them):
-- Note: You may need service role access to query auth.users
-- Or check the UUIDs directly in Supabase Auth UI

-- ============================================================================
-- STEP 2: Update each user's UUID to match their auth user UUID
-- ============================================================================

-- Replace 'AUTH_UUID_STUDENT1' with actual UUID from Supabase Auth UI
UPDATE users
SET id = 'AUTH_UUID_STUDENT1'
WHERE email = 'test.student1@tamu.edu'
AND id != 'AUTH_UUID_STUDENT1'; -- Only update if different

-- Replace 'AUTH_UUID_STUDENT2' with actual UUID from Supabase Auth UI
UPDATE users
SET id = 'AUTH_UUID_STUDENT2'
WHERE email = 'test.student2@tamu.edu'
AND id != 'AUTH_UUID_STUDENT2';

-- Replace 'AUTH_UUID_MENTOR1' with actual UUID from Supabase Auth UI
UPDATE users
SET id = 'AUTH_UUID_MENTOR1'
WHERE email = 'test.mentor1@example.com'
AND id != 'AUTH_UUID_MENTOR1';

-- Replace 'AUTH_UUID_MENTOR2' with actual UUID from Supabase Auth UI
UPDATE users
SET id = 'AUTH_UUID_MENTOR2'
WHERE email = 'test.mentor2@example.com'
AND id != 'AUTH_UUID_MENTOR2';

-- Replace 'AUTH_UUID_MENTOR3' with actual UUID from Supabase Auth UI
UPDATE users
SET id = 'AUTH_UUID_MENTOR3'
WHERE email = 'test.mentor3@example.com'
AND id != 'AUTH_UUID_MENTOR3';

-- ============================================================================
-- STEP 3: Update related tables (if needed)
-- ============================================================================

-- Update mentorship_profiles to reference new user IDs
-- These should cascade automatically, but verify:

SELECT 
  mp.id as profile_id,
  mp.user_id,
  u.email,
  CASE 
    WHEN mp.user_id = u.id THEN '✅ Match'
    ELSE '❌ Mismatch'
  END as status
FROM mentorship_profiles mp
JOIN users u ON u.email IN (
  'test.student1@tamu.edu',
  'test.student2@tamu.edu',
  'test.mentor1@example.com',
  'test.mentor2@example.com',
  'test.mentor3@example.com'
)
WHERE mp.user_id != u.id;

-- If there are mismatches, update them:
-- UPDATE mentorship_profiles mp
-- SET user_id = u.id
-- FROM users u
-- WHERE mp.user_id = 'OLD_UUID'
-- AND u.email = 'test.mentor1@example.com';

-- ============================================================================
-- STEP 4: Verification
-- ============================================================================

-- Verify all users exist with correct emails
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role
FROM users u
WHERE u.email IN (
  'test.student1@tamu.edu',
  'test.student2@tamu.edu',
  'test.mentor1@example.com',
  'test.mentor2@example.com',
  'test.mentor3@example.com'
)
ORDER BY u.email;

-- Check if profiles still reference correct user IDs
SELECT 
  mp.id,
  mp.user_id,
  u.email,
  mp.profile_type
FROM mentorship_profiles mp
JOIN users u ON mp.user_id = u.id
WHERE u.email LIKE 'test.%'
ORDER BY u.email;

