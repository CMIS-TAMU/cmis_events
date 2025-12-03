-- ============================================================================
-- MINIMAL SETUP: Just Create Basic Users (No Mentorship Profiles)
-- ============================================================================
-- This creates only the minimum required: users table entries
-- 
-- STEPS:
-- 1. Create auth users in Supabase Dashboard → Authentication → Users
-- 2. Copy each user's UUID
-- 3. Replace UUIDs below with the actual auth user UUIDs
-- 4. Run this script
-- ============================================================================

-- ============================================================================
-- Replace UUIDs below with actual auth user UUIDs from Supabase
-- ============================================================================

-- Student 1
INSERT INTO users (id, email, full_name, role)
VALUES (
  'AUTH_UUID_STUDENT1', -- REPLACE with actual UUID from Supabase
  'test.student1@tamu.edu',
  'Test Student One',
  'student'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role
ON CONFLICT (email) DO UPDATE SET
  id = EXCLUDED.id,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Student 2
INSERT INTO users (id, email, full_name, role)
VALUES (
  'AUTH_UUID_STUDENT2', -- REPLACE with actual UUID
  'test.student2@tamu.edu',
  'Test Student Two',
  'student'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role
ON CONFLICT (email) DO UPDATE SET
  id = EXCLUDED.id,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Mentor 1
INSERT INTO users (id, email, full_name, role)
VALUES (
  'AUTH_UUID_MENTOR1', -- REPLACE with actual UUID
  'test.mentor1@example.com',
  'Test Mentor One',
  'faculty'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role
ON CONFLICT (email) DO UPDATE SET
  id = EXCLUDED.id,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Mentor 2
INSERT INTO users (id, email, full_name, role)
VALUES (
  'AUTH_UUID_MENTOR2', -- REPLACE with actual UUID
  'test.mentor2@example.com',
  'Test Mentor Two',
  'faculty'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role
ON CONFLICT (email) DO UPDATE SET
  id = EXCLUDED.id,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Mentor 3
INSERT INTO users (id, email, full_name, role)
VALUES (
  'AUTH_UUID_MENTOR3', -- REPLACE with actual UUID
  'test.mentor3@example.com',
  'Test Mentor Three',
  'faculty'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role
ON CONFLICT (email) DO UPDATE SET
  id = EXCLUDED.id,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- ============================================================================
-- Verification
-- ============================================================================

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

