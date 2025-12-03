-- ============================================================================
-- Fix: Ignore Expired Pending Match Batches
-- ============================================================================
-- This updates create_match_batch to ignore expired pending batches
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
  v_result jsonb;
  v_student_exists boolean;
BEGIN
  -- Check if student exists and is a student (no profile required)
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
  
  -- FIXED: Check if student has a non-expired pending match batch
  IF EXISTS (
    SELECT 1 FROM match_batches
    WHERE student_id = p_student_id 
    AND status = 'pending'
    AND (expires_at IS NULL OR expires_at > now()) -- Only block if not expired
  ) THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Student already has a pending match batch'
    );
  END IF;
  
  -- Clean up any expired pending batches for this student
  DELETE FROM match_batches
  WHERE student_id = p_student_id
  AND status = 'pending'
  AND expires_at < now();
  
  -- Find top 3 mentors
  SELECT * INTO v_mentor_1 FROM find_top_mentors(p_student_id, 1) LIMIT 1;
  SELECT * INTO v_mentor_2 FROM find_top_mentors(p_student_id, 2) OFFSET 1 LIMIT 1;
  SELECT * INTO v_mentor_3 FROM find_top_mentors(p_student_id, 3) OFFSET 2 LIMIT 1;
  
  -- Check if we found at least one mentor
  IF v_mentor_1.mentor_id IS NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'No available mentors found'
    );
  END IF;
  
  -- Create match batch
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
    v_mentor_1.match_score,
    v_mentor_2.mentor_id,
    v_mentor_2.match_score,
    v_mentor_3.mentor_id,
    v_mentor_3.match_score,
    'pending',
    now() + interval '7 days',
    jsonb_build_object(
      'mentor_1', v_mentor_1.match_reasoning,
      'mentor_2', COALESCE(v_mentor_2.match_reasoning, '{}'::jsonb),
      'mentor_3', COALESCE(v_mentor_3.match_reasoning, '{}'::jsonb)
    )
  ) RETURNING id INTO v_batch_id;
  
  RETURN jsonb_build_object(
    'ok', true,
    'batch_id', v_batch_id,
    'mentor_1', jsonb_build_object(
      'id', v_mentor_1.mentor_id,
      'name', v_mentor_1.mentor_name,
      'score', v_mentor_1.match_score
    ),
    'mentor_2', CASE WHEN v_mentor_2.mentor_id IS NOT NULL THEN
      jsonb_build_object(
        'id', v_mentor_2.mentor_id,
        'name', v_mentor_2.mentor_name,
        'score', v_mentor_2.match_score
      )
    ELSE NULL END,
    'mentor_3', CASE WHEN v_mentor_3.mentor_id IS NOT NULL THEN
      jsonb_build_object(
        'id', v_mentor_3.mentor_id,
        'name', v_mentor_3.mentor_name,
        'score', v_mentor_3.match_score
      )
    ELSE NULL END
  );
END;
$$ LANGUAGE plpgsql;

