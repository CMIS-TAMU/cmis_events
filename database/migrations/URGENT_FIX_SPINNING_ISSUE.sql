-- ============================================================================
-- URGENT FIX: Mentorship Request Spinning Issue
-- ============================================================================
-- Run this IMMEDIATELY in Supabase SQL Editor to fix the spinning issue
-- This ensures the function works even if no mentors exist

-- Step 1: Update create_match_batch to handle NO MENTORS gracefully
-- ============================================================================

CREATE OR REPLACE FUNCTION create_match_batch(
  p_student_id uuid,
  p_request_id uuid DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_batch_id uuid;
  v_mentor_1 record;
  v_mentor_2 record;
  v_mentor_3 record;
  v_student_exists boolean;
  v_mentor_count integer;
BEGIN
  -- Check if student exists and is a student (NO PROFILE REQUIRED)
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = p_student_id AND role = 'student'
  ) INTO v_student_exists;
  
  IF NOT v_student_exists THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Student not found or user is not a student'
    );
  END IF;
  
  -- Check if student already has a pending match batch (ignore expired)
  IF EXISTS (
    SELECT 1 FROM match_batches
    WHERE student_id = p_student_id 
      AND status = 'pending'
      AND expires_at > NOW()
  ) THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Student already has a pending match batch'
    );
  END IF;
  
  -- Check how many available mentors exist
  SELECT COUNT(*) INTO v_mentor_count
  FROM mentorship_profiles
  WHERE profile_type = 'mentor'
    AND availability_status = 'active'
    AND in_matching_pool = true;
  
  -- If no mentors exist, return helpful error
  IF v_mentor_count = 0 THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'No mentors available in the matching pool. Please contact support to add mentors.'
    );
  END IF;
  
  -- Find top 3 mentors (may return fewer if not enough available)
  BEGIN
    SELECT * INTO v_mentor_1 FROM find_top_mentors(p_student_id, 1) LIMIT 1;
  EXCEPTION
    WHEN OTHERS THEN
      v_mentor_1 := NULL;
  END;
  
  BEGIN
    SELECT * INTO v_mentor_2 FROM find_top_mentors(p_student_id, 2) OFFSET 1 LIMIT 1;
  EXCEPTION
    WHEN OTHERS THEN
      v_mentor_2 := NULL;
  END;
  
  BEGIN
    SELECT * INTO v_mentor_3 FROM find_top_mentors(p_student_id, 3) OFFSET 2 LIMIT 1;
  EXCEPTION
    WHEN OTHERS THEN
      v_mentor_3 := NULL;
  END;
  
  -- Check if we found at least one mentor
  IF v_mentor_1.mentor_id IS NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'No mentors found that match your profile. Please update your profile or contact support.'
    );
  END IF;
  
  -- Create match batch (allow NULL mentors if not enough available)
  INSERT INTO match_batches (
    student_id,
    request_id,
    mentor_1_id,
    mentor_1_score,
    mentor_2_id,
    mentor_2_score,
    mentor_3_id,
    mentor_3_score,
    status,
    expires_at,
    match_reasoning
  ) VALUES (
    p_student_id,
    p_request_id,
    v_mentor_1.mentor_id,
    COALESCE(v_mentor_1.match_score, 0),
    v_mentor_2.mentor_id,
    COALESCE(v_mentor_2.match_score, 0),
    v_mentor_3.mentor_id,
    COALESCE(v_mentor_3.match_score, 0),
    'pending',
    NOW() + INTERVAL '7 days',
    jsonb_build_object(
      'mentor_1', COALESCE(v_mentor_1.match_reasoning, '{}'::jsonb),
      'mentor_2', COALESCE(v_mentor_2.match_reasoning, '{}'::jsonb),
      'mentor_3', COALESCE(v_mentor_3.match_reasoning, '{}'::jsonb)
    )
  ) RETURNING id INTO v_batch_id;
  
  RETURN jsonb_build_object(
    'ok', true,
    'batch_id', v_batch_id,
    'mentor_1', jsonb_build_object(
      'id', v_mentor_1.mentor_id,
      'name', COALESCE(v_mentor_1.mentor_name, 'Mentor'),
      'score', COALESCE(v_mentor_1.match_score, 0)
    ),
    'mentor_2', CASE WHEN v_mentor_2.mentor_id IS NOT NULL THEN
      jsonb_build_object(
        'id', v_mentor_2.mentor_id,
        'name', COALESCE(v_mentor_2.mentor_name, 'Mentor'),
        'score', COALESCE(v_mentor_2.match_score, 0)
      )
    ELSE NULL END,
    'mentor_3', CASE WHEN v_mentor_3.mentor_id IS NOT NULL THEN
      jsonb_build_object(
        'id', v_mentor_3.mentor_id,
        'name', COALESCE(v_mentor_3.mentor_name, 'Mentor'),
        'score', COALESCE(v_mentor_3.match_score, 0)
      )
    ELSE NULL END
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'An error occurred while creating match batch: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Step 2: Create a test mentor quickly (for demo purposes)
-- ============================================================================
-- Uncomment and modify to create a mentor from an existing user

/*
-- First, find a user who should be a mentor (faculty or admin)
SELECT id, email, full_name, role 
FROM users 
WHERE role IN ('faculty', 'admin') 
LIMIT 1;

-- Then create mentor profile (replace USER_ID with actual UUID from above)
INSERT INTO mentorship_profiles (
  user_id,
  profile_type,
  industry,
  areas_of_expertise,
  max_mentees,
  availability_status,
  in_matching_pool,
  preferred_name,
  contact_email
) 
VALUES (
  'USER_ID_HERE',  -- Replace with actual user UUID
  'mentor',
  'Technology',
  ARRAY['Software Engineering', 'Machine Learning', 'Web Development', 'Data Science'],
  5,
  'active',
  true,
  'Demo Mentor',
  'mentor@example.com'
)
ON CONFLICT DO NOTHING;
*/

-- ============================================================================
-- Step 3: Clear any blocking pending batches
-- ============================================================================

-- Update expired batches
UPDATE match_batches
SET status = 'expired'
WHERE status = 'pending' AND expires_at < NOW();

-- Delete very old batches (optional, for cleanup)
-- DELETE FROM match_batches WHERE status = 'expired' AND expires_at < NOW() - INTERVAL '30 days';

COMMENT ON FUNCTION create_match_batch IS 'Creates match batch with top mentors. Handles no mentors gracefully. NO STUDENT PROFILE REQUIRED.';

-- ============================================================================
-- DONE! Now test by:
-- 1. Ensuring at least one mentor exists (use query above)
-- 2. Trying to request a mentor from the UI
-- 3. Check browser console for any errors
-- ============================================================================

