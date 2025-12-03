-- ============================================================================
-- Force Clear ALL Match Batches (All Statuses)
-- ============================================================================
-- Use this if you want to completely reset all match batches for testing
-- ============================================================================

-- ⚠️ WARNING: This will delete ALL match batches (pending, accepted, rejected, etc.)

-- Step 1: Check what will be deleted
SELECT 
  status,
  COUNT(*) as count
FROM match_batches
GROUP BY status;

-- Step 2: Delete ALL match batches
DELETE FROM match_batches;

-- Step 3: Verify deletion
SELECT COUNT(*) as remaining_batches FROM match_batches;
-- Should return 0

-- ============================================================================
-- Alternative: Only clear pending and expired batches (safer)
-- ============================================================================

-- Delete only pending batches (including expired ones)
DELETE FROM match_batches
WHERE status = 'pending';

-- Delete expired batches regardless of status
DELETE FROM match_batches
WHERE expires_at < now() - interval '1 day';

-- ============================================================================
-- Clear for specific student emails
-- ============================================================================

-- Clear ALL batches (any status) for your test students
DELETE FROM match_batches
WHERE student_id IN (
  SELECT id FROM users 
  WHERE email IN (
    'abhishektest@gmail.com',
    'abhishektest2@gmail.com'
  )
);

-- Verify
SELECT 
  mb.id,
  u.email,
  mb.status
FROM match_batches mb
JOIN users u ON mb.student_id = u.id
WHERE u.email LIKE '%abhishek%';

