-- ============================================================================
-- Find and Clear Pending Match Batch for Specific Student
-- ============================================================================
-- Use this to find and clear the pending match batch causing the error
-- ============================================================================

-- Step 1: Show ALL pending match batches with student emails
SELECT 
  mb.id as batch_id,
  mb.student_id,
  u.email as student_email,
  mb.status,
  mb.created_at,
  mb.expires_at,
  CASE 
    WHEN mb.expires_at < now() THEN 'EXPIRED (but still pending!)'
    ELSE 'ACTIVE'
  END as expiration_status
FROM match_batches mb
JOIN users u ON mb.student_id = u.id
WHERE mb.status = 'pending'
ORDER BY mb.created_at DESC;

-- Step 2: Delete ALL pending batches (including expired ones)
DELETE FROM match_batches 
WHERE status = 'pending';

-- Step 3: Also delete expired batches regardless of status (cleanup)
DELETE FROM match_batches 
WHERE expires_at < now() - interval '1 day';

-- Step 4: Verify - should show 0 results
SELECT 
  'Verification' as info,
  COUNT(*) as remaining_pending_batches
FROM match_batches
WHERE status = 'pending';

-- Step 5: Show all match batches (for debugging)
SELECT 
  mb.id,
  u.email,
  mb.status,
  mb.created_at,
  mb.expires_at
FROM match_batches mb
LEFT JOIN users u ON mb.student_id = u.id
ORDER BY mb.created_at DESC
LIMIT 10;

