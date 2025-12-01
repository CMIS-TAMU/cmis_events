-- Quick SQL Script to Make a User Admin
-- Replace 'your-email@example.com' with the actual email address

-- Option 1: Update existing user to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Option 2: Check if user exists and their current role
SELECT id, email, full_name, role, created_at
FROM users 
WHERE email = 'your-email@example.com';

-- Option 3: Create admin user if profile exists in auth.users but not in public.users
INSERT INTO users (id, email, full_name, role)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', 'Admin User') as full_name,
    'admin' as role
FROM auth.users
WHERE email = 'your-email@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'your-email@example.com'
  )
ON CONFLICT (email) DO UPDATE
SET role = 'admin';

-- Option 4: List all users and their roles
SELECT email, full_name, role, created_at
FROM users
ORDER BY created_at DESC;

-- Option 5: List all admins
SELECT email, full_name, role, created_at
FROM users
WHERE role = 'admin';

