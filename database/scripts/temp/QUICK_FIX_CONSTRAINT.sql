-- Quick Fix: Drop the existing constraint
ALTER TABLE mini_mentorship_requests 
DROP CONSTRAINT IF EXISTS fk_scheduled_session;

-- Verify it's dropped
SELECT 'Constraint dropped successfully!' AS status;
