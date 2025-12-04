-- ============================================================================
-- Quick Fix: Drop Existing Constraint
-- ============================================================================
-- Run this if you get the error: "constraint fk_scheduled_session already exists"
-- ============================================================================

-- Drop the constraint if it exists
ALTER TABLE mini_mentorship_requests 
DROP CONSTRAINT IF EXISTS fk_scheduled_session;

-- Verify it's dropped
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'fk_scheduled_session' 
      AND conrelid = 'mini_mentorship_requests'::regclass
    ) 
    THEN 'Constraint still exists' 
    ELSE 'Constraint dropped successfully' 
  END AS status;

-- Now you can continue with the rest of the migration
-- The constraint will be recreated by the migration script

