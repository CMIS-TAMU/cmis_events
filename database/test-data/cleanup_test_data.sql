-- ============================================================================
-- CLEANUP MENTORSHIP TEST DATA
-- ============================================================================
-- This script removes all test data created by setup_mentorship_test_data.sql
-- Use this to reset your test environment
-- ============================================================================

-- Test data IDs (same as in setup script)
DO $$
DECLARE
  test_student_1_id uuid := '00000000-0000-0000-0000-000000000001';
  test_student_2_id uuid := '00000000-0000-0000-0000-000000000002';
  test_mentor_1_id uuid := '00000000-0000-0000-0000-000000000101';
  test_mentor_2_id uuid := '00000000-0000-0000-0000-000000000102';
  test_mentor_3_id uuid := '00000000-0000-0000-0000-000000000103';
  test_match_id uuid := '00000000-0000-0000-0000-000000001001';
  test_batch_id uuid := '00000000-0000-0000-0000-000000005001';
BEGIN
  -- Delete meeting logs
  DELETE FROM meeting_logs 
  WHERE match_id = test_match_id;
  
  -- Delete feedback
  DELETE FROM mentorship_feedback 
  WHERE match_id = test_match_id;
  
  -- Delete matches
  DELETE FROM matches 
  WHERE id = test_match_id;
  
  -- Delete match batches
  DELETE FROM match_batches 
  WHERE id = test_batch_id;
  
  -- Delete quick questions
  DELETE FROM quick_questions 
  WHERE id IN (
    '00000000-0000-0000-0000-000000004001',
    '00000000-0000-0000-0000-000000004002',
    '00000000-0000-0000-0000-000000004003'
  );
  
  -- Reset mentor mentee counts
  UPDATE mentorship_profiles
  SET current_mentees = 0
  WHERE user_id IN (test_mentor_1_id, test_mentor_2_id, test_mentor_3_id);
  
  -- Delete mentor profiles
  DELETE FROM mentorship_profiles 
  WHERE user_id IN (test_mentor_1_id, test_mentor_2_id, test_mentor_3_id);
  
  -- Delete test users
  DELETE FROM users 
  WHERE id IN (
    test_student_1_id,
    test_student_2_id,
    test_mentor_1_id,
    test_mentor_2_id,
    test_mentor_3_id
  );
  
  RAISE NOTICE '✅ Test data cleaned up successfully!';
END $$;

