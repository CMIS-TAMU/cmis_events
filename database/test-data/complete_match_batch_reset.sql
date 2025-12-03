-- ============================================================================
-- Complete Match Batch Reset - Diagnostic + Clear
-- ============================================================================
-- Run this to completely reset match batches and diagnose issues
-- ============================================================================

-- Step 1: Show ALL match batches BEFORE deletion
SELECT 
  'BEFORE DELETION' as stage,
  mb.id,
  mb.student_id,
  u.email as student_email,
  mb.status,
  mb.created_at,
  mb.expires_at,
  CASE 
    WHEN mb.expires_at < now() AND mb.status = 'pending' THEN 'EXPIRED'
    WHEN mb.status = 'pending' THEN 'ACTIVE'
    ELSE mb.status
  END as current_status
FROM match_batches mb
LEFT JOIN users u ON mb.student_id = u.id
ORDER BY mb.created_at DESC;

-- Step 2: Show count by status
SELECT 
  'COUNT BY STATUS' as info,
  status,
  COUNT(*) as count,
  COUNT(CASE WHEN expires_at < now() THEN 1 END) as expired_count
FROM match_batches
GROUP BY status;

-- Step 3: DELETE ALL match batches (nuclear option)
-- Uncomment the line below to delete everything:
-- DELETE FROM match_batches;

-- Step 4: DELETE only for your test students
DELETE FROM match_batches
WHERE student_id IN (
  SELECT id FROM users 
  WHERE email IN (
    'abhishektest@gmail.com',
    'abhishektest2@gmail.com'
  )
);

-- Step 5: Also delete expired pending batches
DELETE FROM match_batches
WHERE status = 'pending' 
AND expires_at < now();

-- Step 6: Show ALL match batches AFTER deletion
SELECT 
  'AFTER DELETION' as stage,
  mb.id,
  mb.student_id,
  u.email as student_email,
  mb.status,
  mb.created_at,
  mb.expires_at
FROM match_batches mb
LEFT JOIN users u ON mb.student_id = u.id
ORDER BY mb.created_at DESC;

-- Step 7: Verify no pending batches exist
SELECT 
  'VERIFICATION' as info,
  COUNT(*) as remaining_pending_batches
FROM match_batches
WHERE status = 'pending';

-- Step 8: Show your student UUIDs (for reference)
SELECT 
  'YOUR STUDENT UUIDs' as info,
  id,
  email,
  full_name,
  role
FROM users
WHERE email IN (
  'abhishektest@gmail.com',
  'abhishektest2@gmail.com'
);

-- Step 9: Check if create_match_batch function exists and works
-- This will show the function definition
SELECT 
  'FUNCTION CHECK' as info,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'create_match_batch';

