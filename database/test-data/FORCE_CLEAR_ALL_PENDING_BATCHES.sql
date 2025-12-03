-- ============================================================================
-- FORCE CLEAR: Delete ALL Pending Match Batches (Nuclear Option)
-- ============================================================================
-- This will delete ALL pending batches regardless of expiration status
-- Use this if you're still getting the error after trying other fixes
-- ============================================================================

-- Step 1: Show what we're about to delete
SELECT 
  'BATCHES TO BE DELETED:' as info,
  mb.id,
  u.email as student_email,
  mb.status,
  mb.created_at,
  mb.expires_at
FROM match_batches mb
LEFT JOIN users u ON mb.student_id = u.id
WHERE mb.status = 'pending'
ORDER BY mb.created_at DESC;

-- Step 2: Delete ALL pending batches (regardless of expiration)
DELETE FROM match_batches WHERE status = 'pending';

-- Step 3: Also delete any expired batches (regardless of status)
DELETE FROM match_batches WHERE expires_at < now() - interval '1 hour';

-- Step 4: Verify deletion - should return 0
SELECT 
  'VERIFICATION:' as info,
  COUNT(*) as remaining_pending_batches,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ SUCCESS: All pending batches cleared!'
    ELSE '❌ WARNING: Still have ' || COUNT(*) || ' pending batches'
  END as status
FROM match_batches
WHERE status = 'pending';

-- Step 5: Show all remaining match batches (for reference)
SELECT 
  'REMAINING BATCHES:' as info,
  mb.id,
  u.email as student_email,
  mb.status,
  mb.created_at,
  mb.expires_at
FROM match_batches mb
LEFT JOIN users u ON mb.student_id = u.id
ORDER BY mb.created_at DESC
LIMIT 10;

