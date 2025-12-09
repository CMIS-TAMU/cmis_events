-- ============================================================================
-- RESET PENDING MATCH BATCH
-- Purpose: Clear existing pending match batches so student can request again
-- ============================================================================

-- OPTION 1: Delete the pending match batch for a specific student
-- Replace 'abhishek.patil@tamu.edu' with your student email
DELETE FROM match_batches
WHERE student_id = (SELECT id FROM users WHERE email = 'abhishek.patil@tamu.edu')
  AND status = 'pending';

-- OPTION 2: Mark all pending match batches as 'expired' instead of deleting
-- (This preserves the history)
UPDATE match_batches
SET status = 'expired'
WHERE student_id = (SELECT id FROM users WHERE email = 'abhishek.patil@tamu.edu')
  AND status = 'pending';

-- OPTION 3: Reset ALL pending match batches (use with caution!)
-- DELETE FROM match_batches WHERE status = 'pending';

-- ============================================================================
-- VERIFICATION: Check current match batches
-- ============================================================================

-- Check if student has any match batches
SELECT 
  mb.id,
  mb.student_id,
  mb.status,
  mb.created_at,
  u.email as student_email,
  u.full_name as student_name
FROM match_batches mb
JOIN users u ON u.id = mb.student_id
WHERE u.email = 'abhishek.patil@tamu.edu'
ORDER BY mb.created_at DESC;

-- Check if student has any active matches (should also be cleared for testing)
SELECT 
  m.id,
  m.student_id,
  m.mentor_id,
  m.status,
  m.matched_at,
  u_student.email as student_email,
  u_mentor.email as mentor_email
FROM matches m
JOIN users u_student ON u_student.id = m.student_id
LEFT JOIN users u_mentor ON u_mentor.id = m.mentor_id
WHERE u_student.email = 'abhishek.patil@tamu.edu'
ORDER BY m.matched_at DESC;

-- ============================================================================
-- COMPLETE RESET: Clear match batches AND active matches (for testing)
-- ============================================================================

-- Step 1: Delete pending match batches
DELETE FROM match_batches
WHERE student_id = (SELECT id FROM users WHERE email = 'abhishek.patil@tamu.edu')
  AND status = 'pending';

-- Step 2: Delete active matches (if you want to start fresh)
-- Uncomment the line below if you want to also clear active matches
-- DELETE FROM matches
-- WHERE student_id = (SELECT id FROM users WHERE email = 'abhishek.patil@tamu.edu')
--   AND status = 'active';

-- Step 3: Verify everything is cleared
SELECT 
  'Match Batches' as type,
  COUNT(*) as count
FROM match_batches
WHERE student_id = (SELECT id FROM users WHERE email = 'abhishek.patil@tamu.edu')
  AND status = 'pending'

UNION ALL

SELECT 
  'Active Matches' as type,
  COUNT(*) as count
FROM matches
WHERE student_id = (SELECT id FROM users WHERE email = 'abhishek.patil@tamu.edu')
  AND status = 'active';

-- ============================================================================
-- NOTES:
-- 1. Replace 'abhishek.patil@tamu.edu' with your student email
-- 2. Run this in Supabase SQL Editor
-- 3. After running, the student should be able to request a mentor again
-- ============================================================================

