-- ============================================================================
-- Clear Pending Match Batch for Testing
-- ============================================================================
-- Use this to clear a pending match batch when testing mentor requests
-- ============================================================================

-- Option 1: Clear pending match batch for a specific student (by email)
-- Replace 'abhishektest@gmail.com' with your student email

DELETE FROM match_batches
WHERE student_id IN (
  SELECT id FROM users WHERE email = 'abhishektest@gmail.com'
)
AND status = 'pending';

-- Option 2: Clear ALL pending match batches (use with caution!)

-- DELETE FROM match_batches WHERE status = 'pending';

-- Option 3: Clear pending match batch for a specific student (by UUID)
-- Replace 'YOUR_STUDENT_UUID_HERE' with the actual student UUID

-- DELETE FROM match_batches
-- WHERE student_id = 'YOUR_STUDENT_UUID_HERE'
-- AND status = 'pending';

-- ============================================================================
-- Verification: Check if any pending match batches exist
-- ============================================================================

SELECT 
  mb.id,
  mb.student_id,
  u.email as student_email,
  mb.status,
  mb.created_at,
  mb.expires_at
FROM match_batches mb
JOIN users u ON mb.student_id = u.id
WHERE mb.status = 'pending'
ORDER BY mb.created_at DESC;

-- ============================================================================
-- Check all match batches (pending, accepted, expired)
-- ============================================================================

SELECT 
  mb.id,
  mb.student_id,
  u.email as student_email,
  mb.status,
  mb.created_at,
  mb.expires_at,
  CASE 
    WHEN mb.expires_at < now() THEN 'Expired'
    WHEN mb.status = 'pending' THEN 'Active'
    ELSE mb.status
  END as current_status
FROM match_batches mb
JOIN users u ON mb.student_id = u.id
ORDER BY mb.created_at DESC;

