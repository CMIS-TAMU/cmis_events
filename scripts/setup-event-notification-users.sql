-- Setup script to ensure specific users receive event notifications
-- Run this in Supabase SQL Editor

-- Step 1: Create or update users with correct roles
-- Note: These users should already exist in auth.users from signup
-- This script ensures they exist in the public.users table with correct roles

-- For prasanna.salunkhe@tamu.edu (sponsor)
INSERT INTO users (email, full_name, role)
VALUES ('prasanna.salunkhe@tamu.edu', 'Prasanna Salunkhe', 'sponsor')
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'sponsor',
  full_name = COALESCE(users.full_name, 'Prasanna Salunkhe');

-- For nisarg.sonar@tamu.edu (mentor)
INSERT INTO users (email, full_name, role)
VALUES ('nisarg.sonar@tamu.edu', 'Nisarg Sonar', 'mentor')
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'mentor',
  full_name = COALESCE(users.full_name, 'Nisarg Sonar');

-- Step 2: Enable email notifications for these users
-- Get user IDs first
DO $$
DECLARE
  sponsor_user_id uuid;
  mentor_user_id uuid;
BEGIN
  -- Get sponsor user ID
  SELECT id INTO sponsor_user_id 
  FROM users 
  WHERE email = 'prasanna.salunkhe@tamu.edu';
  
  -- Get mentor user ID
  SELECT id INTO mentor_user_id 
  FROM users 
  WHERE email = 'nisarg.sonar@tamu.edu';
  
  -- Enable email notifications for sponsor
  IF sponsor_user_id IS NOT NULL THEN
    INSERT INTO communication_preferences (user_id, email_enabled, sms_enabled)
    VALUES (sponsor_user_id, true, false)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      email_enabled = true,
      updated_at = now();
  END IF;
  
  -- Enable email notifications for mentor
  IF mentor_user_id IS NOT NULL THEN
    INSERT INTO communication_preferences (user_id, email_enabled, sms_enabled)
    VALUES (mentor_user_id, true, false)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      email_enabled = true,
      updated_at = now();
  END IF;
END $$;

-- Step 3: Verify setup
SELECT 
  u.email,
  u.role,
  u.full_name,
  cp.email_enabled,
  cp.updated_at as preferences_updated
FROM users u
LEFT JOIN communication_preferences cp ON u.id = cp.user_id
WHERE u.email IN ('prasanna.salunkhe@tamu.edu', 'nisarg.sonar@tamu.edu')
ORDER BY u.email;

-- Expected output:
-- prasanna.salunkhe@tamu.edu | sponsor | Prasanna Salunkhe | true | [timestamp]
-- nisarg.sonar@tamu.edu      | mentor  | Nisarg Sonar      | true | [timestamp]


