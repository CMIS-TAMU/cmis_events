-- ============================================================================
-- Complete Diagnostic and Fix for Pending Match Batch Issue
-- ============================================================================
-- Run this to find and fix the pending match batch issue
-- ============================================================================

-- Step 1: Show ALL pending match batches with full details
SELECT 
  '=== ALL PENDING BATCHES ===' as info,
  mb.id as batch_id,
  mb.student_id,
  u.email as student_email,
  u.full_name as student_name,
  mb.status,
  mb.created_at,
  mb.expires_at,
  CASE 
    WHEN mb.expires_at < now() THEN '❌ EXPIRED (but still pending!)'
    WHEN mb.expires_at >= now() THEN '✅ ACTIVE'
    ELSE '⚠️  NO EXPIRATION DATE'
  END as expiration_status,
  EXTRACT(EPOCH FROM (mb.expires_at - now())) / 86400 as days_until_expiry
FROM match_batches mb
LEFT JOIN users u ON mb.student_id = u.id
WHERE mb.status = 'pending'
ORDER BY mb.created_at DESC;

-- Step 2: Delete ALL pending batches (nuclear option)
DELETE FROM match_batches WHERE status = 'pending';

-- Step 3: Delete expired batches (regardless of status)
DELETE FROM match_batches 
WHERE expires_at < now() - interval '1 day';

-- Step 4: Delete for specific student emails (your test accounts)
DELETE FROM match_batches
WHERE student_id IN (
  SELECT id FROM users 
  WHERE email IN (
    'abhishektest@gmail.com',
    'abhishektest2@gmail.com'
  )
);

-- Step 5: Verify - should show 0
SELECT 
  '=== VERIFICATION ===' as info,
  COUNT(*) as remaining_pending_batches,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ All cleared!'
    ELSE '❌ Still have ' || COUNT(*) || ' pending batches'
  END as status
FROM match_batches
WHERE status = 'pending';

-- Step 6: Show ALL match batches (any status) for your students
SELECT 
  '=== ALL BATCHES FOR YOUR STUDENTS ===' as info,
  mb.id,
  mb.student_id,
  u.email,
  mb.status,
  mb.created_at,
  mb.expires_at
FROM match_batches mb
JOIN users u ON mb.student_id = u.id
WHERE u.email IN (
  'abhishektest@gmail.com',
  'abhishektest2@gmail.com'
)
ORDER BY mb.created_at DESC;

