-- ============================================================================
-- Check Which Student UUID is Being Used
-- ============================================================================
-- This helps verify if the logged-in student UUID matches what's in the database
-- ============================================================================

-- Show all your test students with their UUIDs
SELECT 
  id,
  email,
  full_name,
  role,
  'Use this UUID when checking match batches' as note
FROM users
WHERE email LIKE '%abhishek%'
ORDER BY email;

-- Check match batches for these specific UUIDs
SELECT 
  mb.id,
  mb.student_id,
  u.email as student_email,
  mb.status,
  mb.created_at,
  CASE 
    WHEN mb.status = 'pending' AND mb.expires_at < now() THEN 'EXPIRED (but still pending!)'
    WHEN mb.status = 'pending' THEN 'ACTIVE PENDING'
    ELSE mb.status
  END as current_status
FROM match_batches mb
JOIN users u ON mb.student_id = u.id
WHERE u.email LIKE '%abhishek%'
ORDER BY mb.created_at DESC;

-- Check if there are ANY pending batches (all students)
SELECT 
  COUNT(*) as total_pending,
  COUNT(CASE WHEN expires_at < now() THEN 1 END) as expired_pending,
  COUNT(CASE WHEN expires_at >= now() THEN 1 END) as active_pending
FROM match_batches
WHERE status = 'pending';

