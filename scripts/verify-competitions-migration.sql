-- Verification Script for Case Competitions Migration
-- Run this in Supabase SQL Editor to verify migration was applied correctly

-- 1. Check if case_competitions table has new columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'case_competitions'
ORDER BY ordinal_position;

-- 2. Check if teams table has new columns
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'teams'
ORDER BY ordinal_position;

-- 3. Check if competition_rubrics table exists
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'competition_rubrics'
ORDER BY ordinal_position;

-- 4. Check if competition_scores table exists
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'competition_scores'
ORDER BY ordinal_position;

-- 5. Check if competition_judges table exists
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'competition_judges'
ORDER BY ordinal_position;

-- 6. Check indexes
SELECT 
    indexname,
    tablename
FROM pg_indexes
WHERE tablename IN (
    'teams',
    'competition_rubrics',
    'competition_scores',
    'competition_judges'
)
ORDER BY tablename, indexname;

-- Expected Results Summary:
-- ✅ case_competitions should have: description, deadline, submission_instructions, 
--    max_team_size, min_team_size, status, results_published
-- ✅ teams should have: submission_url, submission_filename, submitted_at, team_leader_id
-- ✅ competition_rubrics table should exist with: id, competition_id, criterion, description, 
--    max_score, weight, order_index, created_at
-- ✅ competition_scores table should exist with: id, team_id, judge_id, rubric_id, score, 
--    comments, created_at, updated_at
-- ✅ competition_judges table should exist with: id, competition_id, judge_id, assigned_at
-- ✅ Indexes should exist for: teams(competition_id), competition_rubrics(competition_id),
--    competition_scores(team_id), competition_scores(judge_id), competition_judges(competition_id)

