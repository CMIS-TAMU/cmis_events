-- ============================================================================
-- Diagnose Match Batch Issue
-- ============================================================================
-- Use this to check what's actually in the database
-- ============================================================================

-- 1. Check ALL match batches for your test students
SELECT 
  mb.id as batch_id,
  mb.student_id,
  u.email as student_email,
  u.full_name as student_name,
  mb.status,
  mb.created_at,
  mb.expires_at,
  CASE 
    WHEN mb.expires_at < now() AND mb.status = 'pending' THEN 'EXPIRED (but still pending)'
    WHEN mb.status = 'pending' THEN 'Active Pending'
    ELSE mb.status
  END as current_status,
  mb.mentor_1_id,
  mb.mentor_2_id,
  mb.mentor_3_id
FROM match_batches mb
JOIN users u ON mb.student_id = u.id
WHERE u.email LIKE '%abhishek%'
ORDER BY mb.created_at DESC;

-- 2. Check specifically for PENDING match batches
SELECT 
  mb.id as batch_id,
  mb.student_id,
  u.email as student_email,
  mb.status,
  mb.created_at,
  mb.expires_at
FROM match_batches mb
JOIN users u ON mb.student_id = u.id
WHERE mb.status = 'pending'
AND u.email LIKE '%abhishek%';

-- 3. Check for ANY pending match batches (all students)
SELECT 
  COUNT(*) as pending_count,
  COUNT(CASE WHEN expires_at < now() THEN 1 END) as expired_count,
  COUNT(CASE WHEN expires_at >= now() THEN 1 END) as active_count
FROM match_batches
WHERE status = 'pending';

-- 4. Show all match batches (for debugging)
SELECT 
  mb.*,
  u.email as student_email
FROM match_batches mb
LEFT JOIN users u ON mb.student_id = u.id
ORDER BY mb.created_at DESC
LIMIT 10;

