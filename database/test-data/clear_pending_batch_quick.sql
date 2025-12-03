-- ============================================================================
-- Quick Clear: Delete ALL Pending Match Batches
-- ============================================================================
-- Run this to clear all pending match batches so you can request a mentor again
-- ============================================================================

-- Delete ALL pending match batches
DELETE FROM match_batches WHERE status = 'pending';

-- Verify deletion
SELECT 
  'Remaining pending batches: ' || COUNT(*)::text as result
FROM match_batches
WHERE status = 'pending';
-- Should return: "Remaining pending batches: 0"

