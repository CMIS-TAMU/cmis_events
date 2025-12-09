-- Simple query to check all 7 mentorship tables
-- Run this in Supabase SQL Editor

SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mentorship_profiles') THEN '✅' ELSE '❌' END || ' mentorship_profiles' as table_1,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'match_batches') THEN '✅' ELSE '❌' END || ' match_batches' as table_2,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'matches') THEN '✅' ELSE '❌' END || ' matches' as table_3,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mentorship_feedback') THEN '✅' ELSE '❌' END || ' mentorship_feedback' as table_4,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quick_questions') THEN '✅' ELSE '❌' END || ' quick_questions' as table_5,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'meeting_logs') THEN '✅' ELSE '❌' END || ' meeting_logs' as table_6,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mentorship_requests') THEN '✅' ELSE '❌' END || ' mentorship_requests' as table_7;

