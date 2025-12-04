-- ============================================================================
-- Update Matching Functions to Use Users Table for Students
-- ============================================================================
-- This migration updates the matching algorithm to use existing user data
-- instead of requiring students to create mentorship profiles
-- ============================================================================

-- ============================================================================
-- 1. Update calculate_match_score to use users table for students
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
  v_student_skills text[];
  v_student_interests text[];
  v_student_career_goals text;
BEGIN
  -- Get student data from users table
  SELECT 
    u.*,
    u.skills AS technical_skills,
    -- Properly convert JSON array to PostgreSQL array
    CASE 
      WHEN u.metadata->'research_interests' IS NULL THEN ARRAY[]::text[]
      WHEN jsonb_typeof(u.metadata->'research_interests') = 'array' THEN
        ARRAY(SELECT jsonb_array_elements_text(u.metadata->'research_interests'))
      ELSE ARRAY[]::text[]
    END AS research_interests,
    u.metadata->>'career_goals' AS career_goals
  INTO v_student_user
  FROM users u
  WHERE u.id = p_student_id AND u.role = 'student';
  
  -- Get mentor profile (mentors still need profiles)
  SELECT * INTO v_mentor_profile
  FROM mentorship_profiles
  WHERE user_id = p_mentor_id AND profile_type = 'mentor';
  
  -- Check if student exists and is a student
  IF v_student_user IS NULL THEN
    RETURN jsonb_build_object(
      'total_score', 0,
      'error', 'Student not found or not a student'
    );
  END IF;
  
  -- Check if mentor profile exists
  IF v_mentor_profile IS NULL THEN
    RETURN jsonb_build_object(
      'total_score', 0,
      'error', 'Mentor profile not found'
    );
  END IF;
  
  -- Check if mentor is available
  IF v_mentor_profile.availability_status != 'active' THEN
    RETURN jsonb_build_object(
      'total_score', 0,
      'error', 'Mentor not available'
    );
  END IF;
  
  -- Check if mentor has capacity
  IF v_mentor_profile.current_mentees >= v_mentor_profile.max_mentees THEN
    RETURN jsonb_build_object(
      'total_score', 0,
      'error', 'Mentor at capacity'
    );
  END IF;
  
  -- Extract student data
  v_student_skills := COALESCE(v_student_user.skills, ARRAY[]::text[]);
  v_student_interests := COALESCE(v_student_user.research_interests, ARRAY[]::text[]);
  v_student_career_goals := v_student_user.career_goals;
  
  -- ========================================================================
  -- 1. Career Goals Alignment (30% weight)
  -- ========================================================================
  IF v_student_career_goals IS NOT NULL AND v_mentor_profile.areas_of_expertise IS NOT NULL THEN
    -- Simple text matching
    IF LOWER(v_student_career_goals) LIKE '%' || LOWER(v_mentor_profile.industry) || '%' THEN
      v_career_goals_score := 100;
    ELSIF v_mentor_profile.areas_of_expertise && ARRAY[v_student_career_goals] THEN
      v_career_goals_score := 85;
    ELSE
      v_career_goals_score := 40; -- Partial match
    END IF;
  ELSE
    v_career_goals_score := 50; -- Neutral if missing
  END IF;
  
  -- ========================================================================
  -- 2. Industry/Expertise Match (25% weight)
  -- ========================================================================
  IF v_student_user.major IS NOT NULL AND v_mentor_profile.industry IS NOT NULL THEN
    IF LOWER(v_mentor_profile.industry) LIKE '%' || LOWER(v_student_user.major) || '%' THEN
      v_industry_score := 100;
    ELSE
      v_industry_score := 50; -- Neutral
    END IF;
  ELSE
    v_industry_score := 50; -- Neutral if missing
  END IF;
  
  -- Check expertise overlap with skills/interests
  IF v_mentor_profile.areas_of_expertise IS NOT NULL AND (array_length(v_student_interests, 1) > 0 OR array_length(v_student_skills, 1) > 0) THEN
    DECLARE
      v_common_count integer;
      v_total_count integer;
    BEGIN
      -- Count common items (skills or interests)
      SELECT COUNT(*) INTO v_common_count
      FROM unnest(v_mentor_profile.areas_of_expertise) AS mentor_exp
      WHERE mentor_exp = ANY(v_student_interests) OR mentor_exp = ANY(v_student_skills);
      
      v_total_count := GREATEST(
        array_length(v_mentor_profile.areas_of_expertise, 1),
        GREATEST(
          array_length(v_student_interests, 1),
          array_length(v_student_skills, 1)
        ),
        1
      );
      
      IF v_common_count > 0 AND v_total_count > 0 THEN
        v_industry_score := GREATEST(v_industry_score, (v_common_count::numeric / v_total_count::numeric) * 100);
      END IF;
    END;
  END IF;
  
  -- ========================================================================
  -- 3. Research Interests Overlap (20% weight) - Use skills/interests
  -- ========================================================================
  IF array_length(v_student_interests, 1) > 0 AND v_mentor_profile.areas_of_expertise IS NOT NULL THEN
    DECLARE
      v_common_count integer;
      v_student_count integer;
      v_overlap_percentage numeric;
    BEGIN
      SELECT COUNT(*) INTO v_common_count
      FROM unnest(v_student_interests) AS student_interest
      WHERE student_interest = ANY(v_mentor_profile.areas_of_expertise);
      
      v_student_count := array_length(v_student_interests, 1);
      
      IF v_student_count > 0 THEN
        v_overlap_percentage := (v_common_count::numeric / v_student_count::numeric) * 100;
        v_research_interests_score := v_overlap_percentage;
      ELSE
        v_research_interests_score := 0;
      END IF;
    END;
  ELSIF array_length(v_student_interests, 1) = 0 THEN
    v_research_interests_score := 50; -- Neutral if no interests specified
  END IF;
  
  -- ========================================================================
  -- 4. Technical Skills Alignment (15% weight)
  -- ========================================================================
  IF array_length(v_student_skills, 1) > 0 AND v_mentor_profile.areas_of_expertise IS NOT NULL THEN
    DECLARE
      v_common_skills integer;
      v_student_skills_count integer;
    BEGIN
      SELECT COUNT(*) INTO v_common_skills
      FROM unnest(v_student_skills) AS skill
      WHERE skill = ANY(v_mentor_profile.areas_of_expertise);
      
      v_student_skills_count := array_length(v_student_skills, 1);
      
      IF v_student_skills_count > 0 THEN
        v_technical_skills_score := (v_common_skills::numeric / v_student_skills_count::numeric) * 100;
      ELSE
        v_technical_skills_score := 0;
      END IF;
    END;
  ELSE
    v_technical_skills_score := 50; -- Neutral if missing
  END IF;
  
  -- ========================================================================
  -- 5. Location Proximity (5% weight) - Skip for now (no location data in users table)
  -- ========================================================================
  v_location_score := 50; -- Neutral (no location matching yet)
  
  -- ========================================================================
  -- 6. Communication Preferences (5% weight) - Skip for now
  -- ========================================================================
  v_communication_score := 50; -- Neutral
  
  -- ========================================================================
  -- Calculate Total Weighted Score
  -- ========================================================================
  v_total_score := 
    (v_career_goals_score * 0.30) +
    (v_industry_score * 0.25) +
    (v_research_interests_score * 0.20) +
    (v_technical_skills_score * 0.15) +
    (v_location_score * 0.05) +
    (v_communication_score * 0.05);
  
  -- Build reasoning JSON
  v_reasoning := jsonb_build_object(
    'career_goals', jsonb_build_object(
      'score', ROUND(v_career_goals_score, 2),
      'weight', 30,
      'weighted_score', ROUND(v_career_goals_score * 0.30, 2)
    ),
    'industry', jsonb_build_object(
      'score', ROUND(v_industry_score, 2),
      'weight', 25,
      'weighted_score', ROUND(v_industry_score * 0.25, 2)
    ),
    'research_interests', jsonb_build_object(
      'score', ROUND(v_research_interests_score, 2),
      'weight', 20,
      'weighted_score', ROUND(v_research_interests_score * 0.20, 2)
    ),
    'technical_skills', jsonb_build_object(
      'score', ROUND(v_technical_skills_score, 2),
      'weight', 15,
      'weighted_score', ROUND(v_technical_skills_score * 0.15, 2)
    ),
    'location', jsonb_build_object(
      'score', ROUND(v_location_score, 2),
      'weight', 5,
      'weighted_score', ROUND(v_location_score * 0.05, 2)
    ),
    'communication', jsonb_build_object(
      'score', ROUND(v_communication_score, 2),
      'weight', 5,
      'weighted_score', ROUND(v_communication_score * 0.05, 2)
    )
  );
  
  RETURN jsonb_build_object(
    'total_score', ROUND(v_total_score, 2),
    'reasoning', v_reasoning,
    'student_id', p_student_id,
    'mentor_id', p_mentor_id
  );
  
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. Update find_top_mentors (no changes needed, uses calculate_match_score)
-- ============================================================================

-- ============================================================================
-- 3. Update create_match_batch to remove student profile requirement
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
  
  -- Check if student already has a pending match batch
  IF EXISTS (
    SELECT 1 FROM match_batches
    WHERE student_id = p_student_id AND status = 'pending'
  ) THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Student already has a pending match batch'
    );
  END IF;
  
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

-- ============================================================================
-- Update Comments
-- ============================================================================

COMMENT ON FUNCTION calculate_match_score IS 'Calculates weighted compatibility score between student (from users table) and mentor (from mentorship_profiles) (0-100)';
COMMENT ON FUNCTION create_match_batch IS 'Creates a match batch with top 3 mentors for a student (no profile required)';

