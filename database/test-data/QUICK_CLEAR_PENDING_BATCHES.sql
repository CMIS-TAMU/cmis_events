-- ============================================================================
-- QUICK FIX: Clear ALL Pending Match Batches
-- ============================================================================
-- Run this entire script to clear all pending batches immediately
-- ============================================================================

-- Delete ALL pending batches
DELETE FROM match_batches WHERE status = 'pending';

-- Also delete expired batches (just in case)
DELETE FROM match_batches WHERE expires_at < now() - interval '1 day';

-- Verify it's cleared
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ SUCCESS: All pending batches cleared!'
    ELSE '❌ ERROR: Still have ' || COUNT(*) || ' pending batches'
  END as status
FROM match_batches
WHERE status = 'pending';

