-- ============================================================================
-- Mentorship Matching System - Matching Algorithm Functions
-- ============================================================================
-- This migration adds the weighted matching algorithm and helper functions
-- Run this after the schema migration
-- ============================================================================

-- ============================================================================
-- 1. Calculate Match Score Between Student and Mentor
-- ============================================================================
-- Weighted algorithm considering:
-- - Career goals alignment (30%)
-- - Industry/expertise match (25%)
-- - Research interests overlap (20%)
-- - Technical skills alignment (15%)
-- - Location proximity (5%)
-- - Communication/meeting preferences (5%)

CREATE OR REPLACE FUNCTION calculate_match_score(
  p_student_id uuid,
  p_mentor_id uuid
) RETURNS jsonb AS $$
DECLARE
  v_student_profile record;
  v_mentor_profile record;
  v_total_score numeric := 0;
  v_career_goals_score numeric := 0;
  v_industry_score numeric := 0;
  v_research_interests_score numeric := 0;
  v_technical_skills_score numeric := 0;
  v_location_score numeric := 0;
  v_communication_score numeric := 0;
  v_reasoning jsonb;
BEGIN
  -- Get student profile
  SELECT * INTO v_student_profile
  FROM mentorship_profiles
  WHERE user_id = p_student_id AND profile_type = 'student';
  
  -- Get mentor profile
  SELECT * INTO v_mentor_profile
  FROM mentorship_profiles
  WHERE user_id = p_mentor_id AND profile_type = 'mentor';
  
  -- Check if both profiles exist
  IF v_student_profile IS NULL OR v_mentor_profile IS NULL THEN
    RETURN jsonb_build_object(
      'total_score', 0,
      'error', 'Profile not found'
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
  
  -- ========================================================================
  -- 1. Career Goals Alignment (30% weight)
  -- ========================================================================
  IF v_student_profile.career_goals IS NOT NULL AND v_mentor_profile.areas_of_expertise IS NOT NULL THEN
    -- Simple text matching for now - can be enhanced with NLP
    IF LOWER(v_student_profile.career_goals) LIKE '%' || LOWER(v_mentor_profile.industry) || '%' THEN
      v_career_goals_score := 100;
    ELSIF v_mentor_profile.areas_of_expertise && ARRAY[v_student_profile.career_goals] THEN
      v_career_goals_score := 85;
    ELSE
      -- Check for keyword overlap
      v_career_goals_score := 40; -- Partial match
    END IF;
  ELSE
    v_career_goals_score := 50; -- Neutral if missing
  END IF;
  
  -- ========================================================================
  -- 2. Industry/Expertise Match (25% weight)
  -- ========================================================================
  IF v_student_profile.major IS NOT NULL AND v_mentor_profile.industry IS NOT NULL THEN
    -- Check if mentor's industry aligns with student's major
    -- This is a simplified check - can be enhanced with industry-major mapping
    IF LOWER(v_mentor_profile.industry) LIKE '%' || LOWER(v_student_profile.major) || '%' THEN
      v_industry_score := 100;
    ELSE
      v_industry_score := 50; -- Neutral
    END IF;
  END IF;
  
  -- Check expertise overlap
  IF v_mentor_profile.areas_of_expertise IS NOT NULL AND v_student_profile.research_interests IS NOT NULL THEN
    -- Calculate overlap percentage
    DECLARE
      v_common_interests integer;
      v_total_interests integer;
    BEGIN
      SELECT COUNT(*) INTO v_common_interests
      FROM unnest(v_mentor_profile.areas_of_expertise) AS mentor_exp
      WHERE mentor_exp = ANY(v_student_profile.research_interests);
      
      v_total_interests := GREATEST(
        array_length(v_mentor_profile.areas_of_expertise, 1),
        array_length(v_student_profile.research_interests, 1),
        1
      );
      
      IF v_common_interests > 0 THEN
        v_industry_score := GREATEST(v_industry_score, (v_common_interests::numeric / v_total_interests::numeric) * 100);
      END IF;
    END;
  END IF;
  
  -- ========================================================================
  -- 3. Research Interests Overlap (20% weight)
  -- ========================================================================
  IF v_student_profile.research_interests IS NOT NULL AND v_mentor_profile.areas_of_expertise IS NOT NULL THEN
    DECLARE
      v_common_count integer;
      v_student_count integer;
      v_overlap_percentage numeric;
    BEGIN
      -- Count common interests
      SELECT COUNT(*) INTO v_common_count
      FROM unnest(v_student_profile.research_interests) AS student_interest
      WHERE student_interest = ANY(v_mentor_profile.areas_of_expertise);
      
      v_student_count := array_length(v_student_profile.research_interests, 1);
      
      IF v_student_count > 0 THEN
        v_overlap_percentage := (v_common_count::numeric / v_student_count::numeric) * 100;
        v_research_interests_score := v_overlap_percentage;
      ELSE
        v_research_interests_score := 0;
      END IF;
    END;
  ELSE
    v_research_interests_score := 50; -- Neutral if missing
  END IF;
  
  -- ========================================================================
  -- 4. Technical Skills Alignment (15% weight)
  -- ========================================================================
  IF v_student_profile.technical_skills IS NOT NULL AND v_mentor_profile.areas_of_expertise IS NOT NULL THEN
    DECLARE
      v_common_skills integer;
      v_student_skills_count integer;
    BEGIN
      -- Count overlapping skills
      SELECT COUNT(*) INTO v_common_skills
      FROM unnest(v_student_profile.technical_skills) AS skill
      WHERE skill = ANY(v_mentor_profile.areas_of_expertise);
      
      v_student_skills_count := array_length(v_student_profile.technical_skills, 1);
      
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
  -- 5. Location Proximity (5% weight)
  -- ========================================================================
  IF v_student_profile.location IS NOT NULL AND v_mentor_profile.location IS NOT NULL THEN
    -- Exact match
    IF LOWER(COALESCE(v_student_profile.location, '')) = LOWER(COALESCE(v_mentor_profile.location, '')) THEN
      v_location_score := 100;
    -- Same state (simplified - can enhance with geocoding)
    ELSIF SPLIT_PART(COALESCE(v_student_profile.location, ''), ',', 2) = SPLIT_PART(COALESCE(v_mentor_profile.location, ''), ',', 2) THEN
      v_location_score := 60;
    ELSE
      v_location_score := 30; -- Different location
    END IF;
  ELSE
    v_location_score := 50; -- Neutral if missing
  END IF;
  
  -- ========================================================================
  -- 6. Communication/Meeting Preferences (5% weight)
  -- ========================================================================
  IF v_student_profile.communication_preferences IS NOT NULL AND v_mentor_profile.communication_preferences IS NOT NULL THEN
    -- Check for preference overlap
    DECLARE
      v_common_prefs integer;
      v_total_prefs integer;
    BEGIN
      SELECT COUNT(*) INTO v_common_prefs
      FROM unnest(v_student_profile.communication_preferences) AS student_pref
      WHERE student_pref = ANY(v_mentor_profile.communication_preferences);
      
      v_total_prefs := GREATEST(
        array_length(v_student_profile.communication_preferences, 1),
        array_length(v_mentor_profile.communication_preferences, 1),
        1
      );
      
      IF v_common_prefs > 0 THEN
        v_communication_score := (v_common_prefs::numeric / v_total_prefs::numeric) * 100;
      ELSE
        v_communication_score := 50; -- Neutral
      END IF;
    END;
  ELSE
    v_communication_score := 50; -- Neutral if missing
  END IF;
  
  -- Check meeting frequency match
  IF v_student_profile.meeting_frequency = v_mentor_profile.meeting_frequency THEN
    v_communication_score := GREATEST(v_communication_score, 80);
  END IF;
  
  -- ========================================================================
  -- Calculate Weighted Total Score
  -- ========================================================================
  v_total_score := 
    (v_career_goals_score * 0.30) +
    (v_industry_score * 0.25) +
    (v_research_interests_score * 0.20) +
    (v_technical_skills_score * 0.15) +
    (v_location_score * 0.05) +
    (v_communication_score * 0.05);
  
  -- Round to 2 decimal places
  v_total_score := ROUND(v_total_score::numeric, 2);
  
  -- ========================================================================
  -- Build Reasoning Object
  -- ========================================================================
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
    'total_score', v_total_score,
    'reasoning', v_reasoning,
    'student_id', p_student_id,
    'mentor_id', p_mentor_id
  );
  
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. Find Top Mentors for Student
-- ============================================================================
-- Returns top N mentors (default 3) with match scores

CREATE OR REPLACE FUNCTION find_top_mentors(
  p_student_id uuid,
  p_limit integer DEFAULT 3,
  p_min_score numeric DEFAULT 0
) RETURNS TABLE (
  mentor_id uuid,
  match_score numeric,
  match_reasoning jsonb,
  mentor_name text,
  mentor_email text,
  mentor_industry text,
  mentor_organization text
) AS $$
BEGIN
  RETURN QUERY
  WITH mentor_scores AS (
    SELECT
      mp.user_id AS mentor_id,
      (calculate_match_score(p_student_id, mp.user_id)->>'total_score')::numeric AS score,
      calculate_match_score(p_student_id, mp.user_id)->'reasoning' AS reasoning
    FROM mentorship_profiles mp
    WHERE mp.profile_type = 'mentor'
      AND mp.availability_status = 'active'
      AND mp.in_matching_pool = true
      AND mp.current_mentees < mp.max_mentees
      AND (calculate_match_score(p_student_id, mp.user_id)->>'total_score')::numeric >= p_min_score
  )
  SELECT
    ms.mentor_id,
    ms.score AS match_score,
    ms.reasoning AS match_reasoning,
    u.full_name AS mentor_name,
    u.email AS mentor_email,
    mp.industry AS mentor_industry,
    mp.organization AS mentor_organization
  FROM mentor_scores ms
  JOIN users u ON u.id = ms.mentor_id
  JOIN mentorship_profiles mp ON mp.user_id = ms.mentor_id AND mp.profile_type = 'mentor'
  ORDER BY ms.score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. Create Match Batch (Top 3 Mentors)
-- ============================================================================
-- Creates a match batch record with top 3 mentors

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
BEGIN
  -- Check if student has an active profile
  IF NOT EXISTS (
    SELECT 1 FROM mentorship_profiles
    WHERE user_id = p_student_id AND profile_type = 'student' AND in_matching_pool = true
  ) THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Student profile not found or not in matching pool'
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
      'mentor_2', v_mentor_2.match_reasoning,
      'mentor_3', v_mentor_3.match_reasoning
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
-- 4. Mentor Selects Student from Batch
-- ============================================================================
-- Updates match batch and creates active match

CREATE OR REPLACE FUNCTION mentor_select_student(
  p_mentor_id uuid,
  p_batch_id uuid
) RETURNS jsonb AS $$
DECLARE
  v_batch record;
  v_match_id uuid;
  v_is_mentor_1 boolean := false;
  v_is_mentor_2 boolean := false;
  v_is_mentor_3 boolean := false;
  v_student_id uuid;
  v_match_score numeric;
BEGIN
  -- Get match batch
  SELECT * INTO v_batch
  FROM match_batches
  WHERE id = p_batch_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Match batch not found or already processed'
    );
  END IF;
  
  -- Check if mentor is in the batch
  IF v_batch.mentor_1_id = p_mentor_id THEN
    v_is_mentor_1 := true;
    v_student_id := v_batch.student_id;
    v_match_score := v_batch.mentor_1_score;
  ELSIF v_batch.mentor_2_id = p_mentor_id THEN
    v_is_mentor_2 := true;
    v_student_id := v_batch.student_id;
    v_match_score := v_batch.mentor_2_score;
  ELSIF v_batch.mentor_3_id = p_mentor_id THEN
    v_is_mentor_3 := true;
    v_student_id := v_batch.student_id;
    v_match_score := v_batch.mentor_3_score;
  ELSE
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Mentor not in this match batch'
    );
  END IF;
  
  -- Check if mentor still has capacity
  IF EXISTS (
    SELECT 1 FROM mentorship_profiles
    WHERE user_id = p_mentor_id
      AND profile_type = 'mentor'
      AND current_mentees >= max_mentees
  ) THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Mentor at capacity'
    );
  END IF;
  
  -- Create active match
  INSERT INTO matches (
    student_id,
    mentor_id,
    match_batch_id,
    match_score,
    match_reasoning,
    status,
    matched_at,
    activated_at
  ) VALUES (
    v_student_id,
    p_mentor_id,
    p_batch_id,
    v_match_score,
    CASE
      WHEN v_is_mentor_1 THEN v_batch.match_reasoning->'mentor_1'
      WHEN v_is_mentor_2 THEN v_batch.match_reasoning->'mentor_2'
      WHEN v_is_mentor_3 THEN v_batch.match_reasoning->'mentor_3'
    END,
    'active',
    now(),
    now()
  ) RETURNING id INTO v_match_id;
  
  -- Update match batch
  UPDATE match_batches
  SET
    status = 'claimed',
    selected_mentor_id = p_mentor_id,
    selected_at = now(),
    mentor_1_selected = v_is_mentor_1,
    mentor_2_selected = v_is_mentor_2,
    mentor_3_selected = v_is_mentor_3,
    mentor_1_selected_at = CASE WHEN v_is_mentor_1 THEN now() ELSE NULL END,
    mentor_2_selected_at = CASE WHEN v_is_mentor_2 THEN now() ELSE NULL END,
    mentor_3_selected_at = CASE WHEN v_is_mentor_3 THEN now() ELSE NULL END
  WHERE id = p_batch_id;
  
  -- Mark other mentors as not selected (for tracking)
  -- This happens automatically via the batch status update
  
  RETURN jsonb_build_object(
    'ok', true,
    'match_id', v_match_id,
    'student_id', v_student_id,
    'mentor_id', p_mentor_id,
    'match_score', v_match_score
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. Get At-Risk Matches
-- ============================================================================
-- Identifies matches that need attention (health monitoring)

CREATE OR REPLACE FUNCTION get_at_risk_matches()
RETURNS TABLE (
  match_id uuid,
  student_id uuid,
  mentor_id uuid,
  last_meeting_at timestamptz,
  days_since_meeting integer,
  health_score integer,
  risk_reason text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id AS match_id,
    m.student_id,
    m.mentor_id,
    m.last_meeting_at,
    CASE
      WHEN m.last_meeting_at IS NOT NULL THEN
        EXTRACT(DAY FROM now() - m.last_meeting_at)::integer
      ELSE
        EXTRACT(DAY FROM now() - m.matched_at)::integer
    END AS days_since_meeting,
    m.health_score,
    m.at_risk_reason
  FROM matches m
  WHERE m.status = 'active'
    AND (
      -- No meeting in last 3 weeks
      (m.last_meeting_at IS NULL AND now() - m.matched_at > interval '21 days')
      OR (m.last_meeting_at IS NOT NULL AND now() - m.last_meeting_at > interval '21 days')
      -- No meeting scheduled in next 2 weeks
      OR (m.next_meeting_scheduled_at IS NULL OR m.next_meeting_scheduled_at > now() + interval '14 days')
      -- Low health score
      OR (m.health_score IS NOT NULL AND m.health_score <= 2)
      -- Already marked as at risk
      OR m.is_at_risk = true
    )
  ORDER BY
    CASE
      WHEN m.last_meeting_at IS NOT NULL THEN now() - m.last_meeting_at
      ELSE now() - m.matched_at
    END DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON FUNCTION calculate_match_score IS 'Calculates weighted compatibility score between student and mentor (0-100)';
COMMENT ON FUNCTION find_top_mentors IS 'Finds top N mentors for a student based on match scores';
COMMENT ON FUNCTION create_match_batch IS 'Creates a match batch with top 3 mentors for a student';
COMMENT ON FUNCTION mentor_select_student IS 'Processes mentor selection of student from match batch';
COMMENT ON FUNCTION get_at_risk_matches IS 'Identifies active matches that need attention (health monitoring)';

-- ============================================================================
-- Migration Complete
-- ============================================================================

