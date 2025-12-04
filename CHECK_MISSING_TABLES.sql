-- ============================================================================
-- Check Which Mentorship Tables Exist and Which Are Missing
-- ============================================================================
-- Run this in Supabase SQL Editor to see exactly what's missing
-- ============================================================================

-- Show all mentorship-related tables that exist
SELECT 
  '✅ EXISTS' as status,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (
  table_name LIKE '%mentorship%' 
  OR table_name = 'match_batches'
  OR table_name = 'matches'
  OR table_name = 'quick_questions'
  OR table_name = 'meeting_logs'
)
ORDER BY table_name;

-- Show which expected tables are MISSING
SELECT 
  '❌ MISSING' as status,
  expected_table as table_name
FROM (
  VALUES 
    ('mentorship_profiles'),
    ('match_batches'),
    ('matches'),
    ('mentorship_feedback'),
    ('quick_questions'),
    ('meeting_logs'),
    ('mentorship_requests')
) AS expected_tables(expected_table)
WHERE expected_table NOT IN (
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public'
)
ORDER BY expected_table;

-- Summary count
SELECT 
  (SELECT COUNT(*) 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND (
     table_name LIKE '%mentorship%' 
     OR table_name = 'match_batches'
     OR table_name = 'matches'
     OR table_name = 'quick_questions'
     OR table_name = 'meeting_logs'
   )
  ) as tables_found,
  7 as tables_expected,
  CASE 
    WHEN (SELECT COUNT(*) 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND (
            table_name LIKE '%mentorship%' 
            OR table_name = 'match_batches'
            OR table_name = 'matches'
            OR table_name = 'quick_questions'
            OR table_name = 'meeting_logs'
          )
         ) = 7 THEN '✅ All tables created!'
    ELSE '⚠️ Some tables missing - see list above'
  END as status;

