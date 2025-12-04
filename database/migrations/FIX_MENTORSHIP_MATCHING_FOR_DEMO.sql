-- ============================================================================
-- FIX: Mentorship Matching for Demo
-- ============================================================================
-- This migration ensures students can request mentors without needing a profile
-- It updates all matching functions to use the users table for student data
-- Run this in Supabase SQL Editor

-- Step 1: Update calculate_match_score to use users table for students
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_match_score(
  p_student_id uuid,
  p_mentor_id uuid
) RETURNS jsonb AS $$
DECLARE
  v_student_user record;
  v_mentor_profile record;
  v_total_score numeric := 0;
  v_career_goals_score numeric := 0;
  v_industry_score numeric := 0;
  v_research_interests_score numeric := 0;
  v_technical_skills_score numeric := 0;
  v_location_score numeric := 0;
  v_communication_score numeric := 0;
  v_reasoning jsonb;
  v_student_major text;
  v_student_skills text[];
  v_student_interests text[];
  v_student_goals text;
BEGIN
  -- Get student data from users table (NO PROFILE REQUIRED)
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.major,
    u.skills,
    u.metadata->>'research_interests' as research_interests_json,
    u.metadata->>'career_goals' as career_goals
  INTO v_student_user
  FROM users u
  WHERE u.id = p_student_id AND u.role = 'student';
  
  -- Get mentor profile (mentors still need profiles)
  SELECT * INTO v_mentor_profile
  FROM mentorship_profiles
  WHERE user_id = p_mentor_id AND profile_type = 'mentor';
  
  -- Check if mentor profile exists
  IF v_mentor_profile IS NULL THEN
    RETURN jsonb_build_object(
      'total_score', 0,
      'error', 'Mentor profile not found'
    );
  END IF;
  
  -- Check if student exists
  IF v_student_user IS NULL THEN
    RETURN jsonb_build_object(
      'total_score', 0,
      'error', 'Student not found'
    );
  END IF;
  
  -- Check if mentor is available
  IF v_mentor_profile.availability_status != 'active' OR v_mentor_profile.in_matching_pool != true THEN
    RETURN jsonb_build_object(
      'total_score', 0,
      'error', 'Mentor not available'
    );
  END IF;
  
  -- Check if mentor has capacity
  IF COALESCE(v_mentor_profile.current_mentees, 0) >= COALESCE(v_mentor_profile.max_mentees, 10) THEN
    RETURN jsonb_build_object(
      'total_score', 0,
      'error', 'Mentor at capacity'
    );
  END IF;
  
  -- Extract student data
  v_student_major := v_student_user.major;
  v_student_skills := COALESCE(v_student_user.skills, ARRAY[]::text[]);
  
  -- Parse research_interests from JSON
  IF v_student_user.research_interests_json IS NOT NULL THEN
    BEGIN
      v_student_interests := ARRAY(
        SELECT jsonb_array_elements_text(v_student_user.research_interests_json::jsonb)
      );
    EXCEPTION
      WHEN OTHERS THEN
        v_student_interests := ARRAY[]::text[];
    END;
  ELSE
    v_student_interests := ARRAY[]::text[];
  END IF;
  
  v_student_goals := v_student_user.career_goals;
  
  -- ========================================================================
  -- 1. Career Goals Alignment (30% weight)
  -- ========================================================================
  IF v_student_goals IS NOT NULL AND v_mentor_profile.areas_of_expertise IS NOT NULL THEN
    -- Check if mentor's expertise matches student's career goals
    IF EXISTS (
      SELECT 1 FROM unnest(v_mentor_profile.areas_of_expertise) AS exp
      WHERE LOWER(v_student_goals) LIKE '%' || LOWER(exp) || '%'
    ) THEN
      v_career_goals_score := 100;
    ELSE
      v_career_goals_score := 50;
    END IF;
  ELSE
    v_career_goals_score := 50;
  END IF;
  
  -- ========================================================================
  -- 2. Industry/Major Match (25% weight)
  -- ========================================================================
  IF v_student_major IS NOT NULL AND v_mentor_profile.industry IS NOT NULL THEN
    IF LOWER(v_mentor_profile.industry) LIKE '%' || LOWER(v_student_major) || '%' 
       OR LOWER(v_student_major) LIKE '%' || LOWER(v_mentor_profile.industry) || '%' THEN
      v_industry_score := 100;
    ELSE
      v_industry_score := 50;
    END IF;
  ELSE
    v_industry_score := 50;
  END IF;
  
  -- ========================================================================
  -- 3. Research Interests/Expertise Match (20% weight)
  -- ========================================================================
  IF array_length(v_student_interests, 1) > 0 AND array_length(v_mentor_profile.areas_of_expertise, 1) > 0 THEN
    DECLARE
      v_common_count integer;
      v_total_count integer;
    BEGIN
      SELECT COUNT(*) INTO v_common_count
      FROM unnest(v_student_interests) AS student_int
      WHERE EXISTS (
        SELECT 1 FROM unnest(v_mentor_profile.areas_of_expertise) AS mentor_exp
        WHERE LOWER(student_int) LIKE '%' || LOWER(mentor_exp) || '%'
           OR LOWER(mentor_exp) LIKE '%' || LOWER(student_int) || '%'
      );
      
      v_total_count := GREATEST(
        array_length(v_student_interests, 1),
        array_length(v_mentor_profile.areas_of_expertise, 1),
        1
      );
      
      IF v_common_count > 0 THEN
        v_research_interests_score := (v_common_count::numeric / v_total_count::numeric) * 100;
      ELSE
        v_research_interests_score := 30;
      END IF;
    END;
  ELSE
    v_research_interests_score := 50;
  END IF;
  
  -- ========================================================================
  -- 4. Technical Skills Match (15% weight)
  -- ========================================================================
  IF array_length(v_student_skills, 1) > 0 AND array_length(v_mentor_profile.areas_of_expertise, 1) > 0 THEN
    DECLARE
      v_skill_match_count integer;
    BEGIN
      SELECT COUNT(*) INTO v_skill_match_count
      FROM unnest(v_student_skills) AS skill
      WHERE EXISTS (
        SELECT 1 FROM unnest(v_mentor_profile.areas_of_expertise) AS exp
        WHERE LOWER(skill) LIKE '%' || LOWER(exp) || '%'
           OR LOWER(exp) LIKE '%' || LOWER(skill) || '%'
      );
      
      IF v_skill_match_count > 0 THEN
        v_technical_skills_score := LEAST((v_skill_match_count::numeric / array_length(v_student_skills, 1)::numeric) * 100, 100);
      ELSE
        v_technical_skills_score := 30;
      END IF;
    END;
  ELSE
    v_technical_skills_score := 50;
  END IF;
  
  -- ========================================================================
  -- 5. Location Match (5% weight) - Neutral for now
  -- ========================================================================
  v_location_score := 50;
  
  -- ========================================================================
  -- 6. Communication Preferences (5% weight) - Neutral for now
  -- ========================================================================
  v_communication_score := 50;
  
  -- Calculate weighted total score
  v_total_score := 
    (v_career_goals_score * 0.30) +
    (v_industry_score * 0.25) +
    (v_research_interests_score * 0.20) +
    (v_technical_skills_score * 0.15) +
    (v_location_score * 0.05) +
    (v_communication_score * 0.05);
  
  -- Build reasoning object
  v_reasoning := jsonb_build_object(
    'career_goals', v_career_goals_score,
    'industry', v_industry_score,
    'research_interests', v_research_interests_score,
    'technical_skills', v_technical_skills_score,
    'location', v_location_score,
    'communication', v_communication_score,
    'score', v_total_score
  );
  
  RETURN jsonb_build_object(
    'total_score', ROUND(v_total_score, 2),
    'reasoning', v_reasoning
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Step 2: Update find_top_mentors function (already uses calculate_match_score, should work)
-- ============================================================================

-- This function should already work as it calls calculate_match_score
-- But let's ensure it exists and is correct

-- ============================================================================
-- Step 3: Update create_match_batch to NOT require student profile
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
  
  -- Check if student already has a pending match batch (ignore expired ones)
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
  
  -- Find top 3 mentors using find_top_mentors function
  SELECT * INTO v_mentor_1 FROM find_top_mentors(p_student_id, 1) LIMIT 1;
  SELECT * INTO v_mentor_2 FROM find_top_mentors(p_student_id, 2) OFFSET 1 LIMIT 1;
  SELECT * INTO v_mentor_3 FROM find_top_mentors(p_student_id, 3) OFFSET 2 LIMIT 1;
  
  -- Check if we found at least one mentor
  IF v_mentor_1.mentor_id IS NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'No available mentors found. Please ensure mentors are in the matching pool.'
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
    COALESCE(v_mentor_2.mentor_id, NULL),
    COALESCE(v_mentor_2.match_score, 0),
    COALESCE(v_mentor_3.mentor_id, NULL),
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

-- ============================================================================
-- Step 4: Clear any expired or blocking pending batches
-- ============================================================================

-- Update expired pending batches to 'expired' status
UPDATE match_batches
SET status = 'expired'
WHERE status = 'pending'
  AND expires_at < NOW();

-- ============================================================================
-- Step 5: Add helpful comments
-- ============================================================================

COMMENT ON FUNCTION calculate_match_score IS 'Calculates compatibility score between student (from users table) and mentor (0-100). NO STUDENT PROFILE REQUIRED.';
COMMENT ON FUNCTION create_match_batch IS 'Creates match batch with top 3 mentors for a student. NO STUDENT PROFILE REQUIRED - uses users table data.';

-- ============================================================================
-- DONE! 
-- ============================================================================
-- Now students can request mentors without needing a mentorship profile.
-- The system will use data from the users table (major, skills, metadata).
-- 
-- To test:
-- 1. Ensure you have at least one mentor in mentorship_profiles with:
--    - profile_type = 'mentor'
--    - in_matching_pool = true
--    - availability_status = 'active'
-- 2. Ensure student has role = 'student' in users table
-- 3. Student should have at least: major, skills, or research_interests in metadata
-- 4. Try requesting a mentor from the UI

