-- ============================================================================
-- Find Match Batch by Your Email
-- ============================================================================
-- Replace 'YOUR_EMAIL@example.com' with your actual student email below
-- ============================================================================

-- Replace this email with your actual student email:
\set student_email 'YOUR_EMAIL@example.com'

-- Find pending batches for this email
SELECT 
  mb.id as batch_id,
  mb.student_id,
  u.email,
  mb.status,
  mb.created_at,
  mb.expires_at,
  CASE 
    WHEN mb.expires_at < now() THEN 'EXPIRED'
    ELSE 'ACTIVE'
  END as status_check
FROM match_batches mb
JOIN users u ON mb.student_id = u.id
WHERE u.email = :'student_email'
AND mb.status = 'pending';

-- Delete pending batches for this email
DELETE FROM match_batches
WHERE student_id IN (
  SELECT id FROM users WHERE email = :'student_email'
)
AND status = 'pending';

-- Verify deletion
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ All batches cleared for ' || :'student_email'
    ELSE '❌ Still have ' || COUNT(*) || ' pending batches'
  END as result
FROM match_batches mb
JOIN users u ON mb.student_id = u.id
WHERE u.email = :'student_email'
AND mb.status = 'pending';

