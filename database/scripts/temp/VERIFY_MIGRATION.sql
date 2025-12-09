-- ============================================================================
-- Verification Query for Mentorship System Migration
-- ============================================================================
-- Run this in Supabase SQL Editor to verify all tables were created
-- ============================================================================

-- Check all mentorship-related tables
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'mentorship_profiles' THEN '✅ Core table'
    WHEN table_name = 'match_batches' THEN '✅ Core table'
    WHEN table_name = 'matches' THEN '✅ Core table'
    WHEN table_name = 'mentorship_feedback' THEN '✅ Core table'
    WHEN table_name = 'quick_questions' THEN '✅ Core table'
    WHEN table_name = 'meeting_logs' THEN '✅ Core table'
    WHEN table_name = 'mentorship_requests' THEN '✅ Optional table'
    ELSE '❓ Unexpected table'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (
  table_name LIKE '%mentorship%' 
  OR table_name = 'match_batches'
  OR table_name = 'matches'
  OR table_name LIKE 'quick_questions'
  OR table_name LIKE 'meeting_logs'
)
ORDER BY table_name;

-- Count should be 7
SELECT 
  COUNT(*) as total_tables,
  CASE 
    WHEN COUNT(*) = 7 THEN '✅ All tables created!'
    WHEN COUNT(*) < 7 THEN '⚠️ Some tables missing'
    ELSE '❓ Unexpected count'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (
  table_name LIKE '%mentorship%' 
  OR table_name = 'match_batches'
  OR table_name = 'matches'
  OR table_name LIKE 'quick_questions'
  OR table_name LIKE 'meeting_logs'
);

-- List expected vs actual tables
SELECT 
  'Expected' as type,
  table_name
FROM (VALUES 
  ('mentorship_profiles'),
  ('match_batches'),
  ('matches'),
  ('mentorship_feedback'),
  ('quick_questions'),
  ('meeting_logs'),
  ('mentorship_requests')
) AS expected(table_name)
WHERE table_name NOT IN (
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public'
)
UNION ALL
SELECT 
  'Actual' as type,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (
  table_name LIKE '%mentorship%' 
  OR table_name = 'match_batches'
  OR table_name = 'matches'
  OR table_name LIKE 'quick_questions'
  OR table_name LIKE 'meeting_logs'
)
ORDER BY type, table_name;

