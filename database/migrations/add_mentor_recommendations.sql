-- ============================================================================
-- Intelligent Mentor Recommendations System - Database Schema
-- ============================================================================
-- This migration adds the mentor_recommendations table for automatic
-- mentor recommendations when students complete their profiles
-- ============================================================================

-- ============================================================================
-- 1. MENTOR RECOMMENDATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS mentor_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Top 3 recommended mentors
  mentor_1_id uuid REFERENCES users(id) ON DELETE CASCADE,
  mentor_2_id uuid REFERENCES users(id) ON DELETE CASCADE,
  mentor_3_id uuid REFERENCES users(id) ON DELETE CASCADE,
  
  -- Match scores (0-100)
  mentor_1_score numeric(5,2),
  mentor_2_score numeric(5,2),
  mentor_3_score numeric(5,2),
  
  -- Match reasons (JSONB for flexibility)
  -- Format: { "mentor_1_id": ["Same Industry", "Similar Skills"], ... }
  match_reasons jsonb DEFAULT '{}'::jsonb,
  
  -- Status tracking
  status text DEFAULT 'recommended' CHECK (status IN ('recommended', 'accepted', 'dismissed', 'expired')),
  selected_mentor_id uuid REFERENCES users(id),
  
  -- Timestamps
  recommended_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  accepted_at timestamptz,
  dismissed_at timestamptz,
  
  -- Metadata (optional tracking)
  profile_snapshot jsonb DEFAULT '{}'::jsonb, -- Store profile state when recommended
  auto_generated boolean DEFAULT true, -- True if system-generated, false if manual
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('recommended', 'accepted', 'dismissed', 'expired')),
  CONSTRAINT valid_mentor_ids CHECK (
    (mentor_1_id IS NOT NULL) OR 
    (mentor_1_id IS NULL AND mentor_2_id IS NULL AND mentor_3_id IS NULL)
  )
);

-- ============================================================================
-- 2. INDEXES
-- ============================================================================

-- Index for quick lookup by student and status
CREATE INDEX IF NOT EXISTS idx_mentor_recommendations_student_status 
  ON mentor_recommendations(student_id, status) 
  WHERE status = 'recommended';

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_mentor_recommendations_expires 
  ON mentor_recommendations(expires_at) 
  WHERE status = 'recommended';

-- Index for mentor lookups
CREATE INDEX IF NOT EXISTS idx_mentor_recommendations_mentor1 
  ON mentor_recommendations(mentor_1_id) 
  WHERE mentor_1_id IS NOT NULL;

-- ============================================================================
-- 3. FUNCTION: GENERATE RECOMMENDATIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_mentor_recommendations(p_student_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_student_profile record;
  v_recommendation_id uuid;
  v_mentor_1_id uuid;
  v_mentor_2_id uuid;
  v_mentor_3_id uuid;
  v_mentor_1_score numeric;
  v_mentor_2_score numeric;
  v_mentor_3_score numeric;
  v_mentor_1_reasoning jsonb;
  v_mentor_2_reasoning jsonb;
  v_mentor_3_reasoning jsonb;
  v_match_reasons jsonb;
  v_mentor_rec record;
BEGIN
  -- Get student profile data
  SELECT 
    u.id,
    u.major,
    u.skills,
    u.metadata,
    u.resume_url
  INTO v_student_profile
  FROM users u
  WHERE u.id = p_student_id AND u.role = 'student';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Student not found'
    );
  END IF;
  
  -- Check if student has sufficient data
  IF v_student_profile.major IS NULL 
     AND (v_student_profile.skills IS NULL OR array_length(v_student_profile.skills, 1) IS NULL)
     AND v_student_profile.resume_url IS NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Insufficient profile data. Please add major, skills, or upload resume.'
    );
  END IF;
  
  -- Use existing find_top_mentors function to get top 3 mentors
  -- The function returns a table, so we query it properly
  SELECT mentor_id, match_score, match_reasoning
  INTO v_mentor_1_id, v_mentor_1_score, v_mentor_1_reasoning
  FROM find_top_mentors(p_student_id, 3, 0)
  LIMIT 1;
  
  -- Get second mentor (skip first, take one)
  SELECT mentor_id, match_score, match_reasoning
  INTO v_mentor_2_id, v_mentor_2_score, v_mentor_2_reasoning
  FROM (
    SELECT mentor_id, match_score, match_reasoning
    FROM find_top_mentors(p_student_id, 3, 0)
    OFFSET 1
  ) AS mentors
  LIMIT 1;
  
  -- Get third mentor (skip first two, take one)
  SELECT mentor_id, match_score, match_reasoning
  INTO v_mentor_3_id, v_mentor_3_score, v_mentor_3_reasoning
  FROM (
    SELECT mentor_id, match_score, match_reasoning
    FROM find_top_mentors(p_student_id, 3, 0)
    OFFSET 2
  ) AS mentors
  LIMIT 1;
  
  IF v_mentor_1_id IS NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'No available mentors found'
    );
  END IF;
  
  -- Build match reasons from the reasoning data
  v_match_reasons := jsonb_build_object(
    v_mentor_1_id::text, jsonb_build_array(
      CASE WHEN v_mentor_1_score >= 80 THEN 'Excellent Match' ELSE 'Good Match' END
    )
  );
  
  IF v_mentor_2_id IS NOT NULL THEN
    v_match_reasons := v_match_reasons || jsonb_build_object(
      v_mentor_2_id::text, jsonb_build_array('Good Match')
    );
  END IF;
  
  IF v_mentor_3_id IS NOT NULL THEN
    v_match_reasons := v_match_reasons || jsonb_build_object(
      v_mentor_3_id::text, jsonb_build_array('Good Match')
    );
  END IF;
  
  -- Expire old recommendations for this student
  UPDATE mentor_recommendations
  SET status = 'expired'
  WHERE student_id = p_student_id 
    AND status = 'recommended'
    AND expires_at < now();
  
  -- Create new recommendation
  INSERT INTO mentor_recommendations (
    student_id,
    mentor_1_id,
    mentor_2_id,
    mentor_3_id,
    mentor_1_score,
    mentor_2_score,
    mentor_3_score,
    match_reasons,
    profile_snapshot,
    status,
    recommended_at,
    expires_at
  ) VALUES (
    p_student_id,
    v_mentor_1_id,
    v_mentor_2_id,
    v_mentor_3_id,
    v_mentor_1_score,
    v_mentor_2_score,
    v_mentor_3_score,
    v_match_reasons,
    jsonb_build_object(
      'major', v_student_profile.major,
      'skills', v_student_profile.skills,
      'has_resume', v_student_profile.resume_url IS NOT NULL
    ),
    'recommended',
    now(),
    now() + interval '30 days'
  )
  RETURNING id INTO v_recommendation_id;
  
  RETURN jsonb_build_object(
    'ok', true,
    'recommendation_id', v_recommendation_id,
    'mentor_1_id', v_mentor_1_id,
    'mentor_2_id', v_mentor_2_id,
    'mentor_3_id', v_mentor_3_id,
    'mentor_1_score', v_mentor_1_score,
    'mentor_2_score', v_mentor_2_score,
    'mentor_3_score', v_mentor_3_score
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. FUNCTION: EXPIRE OLD RECOMMENDATIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION expire_old_recommendations()
RETURNS integer AS $$
DECLARE
  v_expired_count integer;
BEGIN
  UPDATE mentor_recommendations
  SET status = 'expired'
  WHERE status = 'recommended'
    AND expires_at < now();
  
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  
  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE mentor_recommendations ENABLE ROW LEVEL SECURITY;

-- Students can view their own recommendations
CREATE POLICY "Students can view own recommendations"
  ON mentor_recommendations
  FOR SELECT
  USING (
    auth.uid() = student_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- Students can update their own recommendations (accept/dismiss)
CREATE POLICY "Students can update own recommendations"
  ON mentor_recommendations
  FOR UPDATE
  USING (
    auth.uid() = student_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- Admins can insert recommendations
CREATE POLICY "Admins can insert recommendations"
  ON mentor_recommendations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- System can insert via service role (for automatic recommendations)
-- Note: Service role bypasses RLS, so this is handled at application level

-- ============================================================================
-- 6. COMMENTS
-- ============================================================================

COMMENT ON TABLE mentor_recommendations IS 'Stores automatic mentor recommendations generated when students complete their profiles';
COMMENT ON COLUMN mentor_recommendations.match_reasons IS 'JSONB object mapping mentor IDs to arrays of match reason strings';
COMMENT ON COLUMN mentor_recommendations.profile_snapshot IS 'Snapshot of student profile at time of recommendation for tracking';
COMMENT ON COLUMN mentor_recommendations.auto_generated IS 'True if system-generated, false if manually created by admin';

-- ============================================================================
-- 7. CLEANUP FUNCTION (OPTIONAL - for maintenance)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_recommendations()
RETURNS void AS $$
BEGIN
  -- Delete recommendations older than 90 days
  DELETE FROM mentor_recommendations
  WHERE status = 'expired'
    AND expires_at < now() - interval '90 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

