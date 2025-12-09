-- ============================================================================
-- Intelligent Engagement Features - Database Schema
-- ============================================================================
-- This migration adds tables and functions for:
-- 1. Re-engagement campaign tracking
-- 2. Sponsor-student matching notifications
-- ============================================================================

-- ============================================================================
-- 1. RE-ENGAGEMENT CAMPAIGN TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS re_engagement_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campaign_type text NOT NULL CHECK (campaign_type IN ('inactive_30d', 'inactive_60d', 'inactive_90d')),
  sent_at timestamptz DEFAULT now(),
  events_recommended jsonb DEFAULT '[]'::jsonb, -- Array of event IDs recommended
  clicked_at timestamptz,
  registered_for_event_id uuid REFERENCES events(id),
  unsubscribed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  
  -- Prevent sending same campaign type to same user within 7 days
  UNIQUE (user_id, campaign_type, sent_at::date)
);

CREATE INDEX IF NOT EXISTS idx_re_engagement_user_id 
  ON re_engagement_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_re_engagement_sent_at 
  ON re_engagement_campaigns(sent_at);
CREATE INDEX IF NOT EXISTS idx_re_engagement_campaign_type 
  ON re_engagement_campaigns(campaign_type);

COMMENT ON TABLE re_engagement_campaigns IS 'Tracks re-engagement emails sent to inactive users';

-- ============================================================================
-- 2. SPONSOR-STUDENT MATCHING NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS sponsor_student_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_score numeric(5,2), -- 0-100 match score
  match_criteria jsonb DEFAULT '{}'::jsonb, -- What matched (major, skills, etc.)
  notified_at timestamptz, -- When notification was sent
  notification_type text CHECK (notification_type IN ('realtime', 'digest')),
  viewed_at timestamptz, -- When sponsor viewed the student profile
  shortlisted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  
  -- Prevent duplicate notifications for same sponsor-student pair
  UNIQUE (sponsor_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_sponsor_student_matches_sponsor_id 
  ON sponsor_student_matches(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_student_matches_student_id 
  ON sponsor_student_matches(student_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_student_matches_notified_at 
  ON sponsor_student_matches(notified_at);
CREATE INDEX IF NOT EXISTS idx_sponsor_student_matches_match_score 
  ON sponsor_student_matches(match_score DESC);

COMMENT ON TABLE sponsor_student_matches IS 'Tracks which students match which sponsors and notification history';

-- ============================================================================
-- 3. SPONSOR DIGEST TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS sponsor_digests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  digest_date date NOT NULL, -- Monday date of the digest week
  matches_included jsonb DEFAULT '[]'::jsonb, -- Array of match IDs included
  sent_at timestamptz DEFAULT now(),
  opened_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz DEFAULT now(),
  
  -- One digest per sponsor per week
  UNIQUE (sponsor_id, digest_date)
);

CREATE INDEX IF NOT EXISTS idx_sponsor_digests_sponsor_id 
  ON sponsor_digests(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_digests_digest_date 
  ON sponsor_digests(digest_date DESC);

COMMENT ON TABLE sponsor_digests IS 'Tracks weekly digest emails sent to sponsors';

-- ============================================================================
-- 4. FUNCTION: Get users inactive for N days
-- ============================================================================

CREATE OR REPLACE FUNCTION get_inactive_users(days_threshold integer DEFAULT 30)
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  last_registration_date timestamptz,
  days_inactive integer,
  major text,
  skills text[],
  preferred_industry text
) AS $$
BEGIN
  RETURN QUERY
  WITH user_last_registration AS (
    SELECT 
      u.id AS user_id,
      u.email,
      u.full_name,
      u.major,
      u.skills,
      u.preferred_industry,
      MAX(er.registered_at) AS last_registration_date
    FROM users u
    LEFT JOIN event_registrations er ON u.id = er.user_id AND er.status = 'registered'
    WHERE u.role = 'student'
      AND u.email IS NOT NULL
    GROUP BY u.id, u.email, u.full_name, u.major, u.skills, u.preferred_industry
  )
  SELECT 
    ulr.user_id,
    ulr.email,
    ulr.full_name,
    ulr.last_registration_date,
    CASE 
      WHEN ulr.last_registration_date IS NULL THEN 
        EXTRACT(DAY FROM (NOW() - (SELECT created_at FROM users WHERE id = ulr.user_id)))::integer
      ELSE 
        EXTRACT(DAY FROM (NOW() - ulr.last_registration_date))::integer
    END AS days_inactive,
    ulr.major,
    ulr.skills,
    ulr.preferred_industry
  FROM user_last_registration ulr
  WHERE (ulr.last_registration_date IS NULL 
         OR ulr.last_registration_date < NOW() - (days_threshold || ' days')::interval)
    -- Exclude users who received re-engagement email in last 7 days
    AND NOT EXISTS (
      SELECT 1 FROM re_engagement_campaigns rec
      WHERE rec.user_id = ulr.user_id
        AND rec.campaign_type = 'inactive_30d'
        AND rec.sent_at > NOW() - interval '7 days'
    )
  ORDER BY days_inactive DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. FUNCTION: Get matching students for a sponsor
-- ============================================================================

CREATE OR REPLACE FUNCTION get_matching_students_for_sponsor(
  p_sponsor_id uuid,
  p_limit integer DEFAULT 10,
  p_min_score numeric DEFAULT 50
)
RETURNS TABLE (
  student_id uuid,
  student_name text,
  student_email text,
  match_score numeric,
  match_reasons jsonb,
  major text,
  skills text[],
  preferred_industry text,
  resume_url text
) AS $$
DECLARE
  v_filters jsonb;
BEGIN
  -- Get sponsor's filter preferences
  SELECT student_filters INTO v_filters
  FROM sponsor_preferences
  WHERE sponsor_id = p_sponsor_id;
  
  -- If no filters set, return all active students with resumes
  IF v_filters IS NULL OR jsonb_typeof(v_filters) = 'null' OR v_filters = '{}'::jsonb THEN
    RETURN QUERY
    SELECT 
      u.id,
      u.full_name,
      u.email,
      50.0::numeric AS match_score, -- Default score if no filters
      '{}'::jsonb AS match_reasons,
      u.major,
      u.skills,
      u.preferred_industry,
      u.resume_url
    FROM users u
    WHERE u.role = 'student'
      AND u.resume_url IS NOT NULL
      AND u.email IS NOT NULL
      -- Exclude already notified in last 7 days
      AND NOT EXISTS (
        SELECT 1 FROM sponsor_student_matches ssm
        WHERE ssm.sponsor_id = p_sponsor_id
          AND ssm.student_id = u.id
          AND ssm.notified_at > NOW() - interval '7 days'
      )
    ORDER BY u.created_at DESC
    LIMIT p_limit;
    RETURN;
  END IF;
  
  -- Match against filters
  RETURN QUERY
  SELECT 
    u.id,
    u.full_name,
    u.email,
    calculate_match_score_for_sponsor(u.id, v_filters) AS match_score,
    calculate_match_reasons_for_sponsor(u.id, v_filters) AS match_reasons,
    u.major,
    u.skills,
    u.preferred_industry,
    u.resume_url
  FROM users u
  WHERE u.role = 'student'
    AND u.resume_url IS NOT NULL
    AND u.email IS NOT NULL
    -- Exclude already notified in last 7 days
    AND NOT EXISTS (
      SELECT 1 FROM sponsor_student_matches ssm
      WHERE ssm.sponsor_id = p_sponsor_id
        AND ssm.student_id = u.id
        AND ssm.notified_at > NOW() - interval '7 days'
    )
    AND calculate_match_score_for_sponsor(u.id, v_filters) >= p_min_score
  ORDER BY calculate_match_score_for_sponsor(u.id, v_filters) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. HELPER FUNCTION: Calculate match score for sponsor
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_match_score_for_sponsor(
  p_student_id uuid,
  p_filters jsonb
)
RETURNS numeric AS $$
DECLARE
  v_score numeric := 0;
  v_student record;
  v_filter_majors text[];
  v_filter_skills text[];
  v_filter_industries text[];
  v_match_count integer := 0;
BEGIN
  -- Get student data
  SELECT major, skills, preferred_industry, resume_url
  INTO v_student
  FROM users
  WHERE id = p_student_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- If student has no resume, return low score
  IF v_student.resume_url IS NULL THEN
    RETURN 10;
  END IF;
  
  -- Check major match (40 points)
  IF p_filters->'majors' IS NOT NULL THEN
    SELECT ARRAY(SELECT jsonb_array_elements_text(p_filters->'majors')) INTO v_filter_majors;
    IF v_student.major = ANY(v_filter_majors) THEN
      v_score := v_score + 40;
      v_match_count := v_match_count + 1;
    END IF;
  END IF;
  
  -- Check skills match (30 points)
  IF p_filters->'skills' IS NOT NULL AND v_student.skills IS NOT NULL THEN
    SELECT ARRAY(SELECT jsonb_array_elements_text(p_filters->'skills')) INTO v_filter_skills;
    SELECT COUNT(*) INTO v_match_count
    FROM unnest(v_student.skills) AS skill
    WHERE skill = ANY(v_filter_skills);
    
    IF v_match_count > 0 THEN
      v_score := v_score + LEAST(30, v_match_count * 10);
    END IF;
  END IF;
  
  -- Check industry match (20 points)
  IF p_filters->'industries' IS NOT NULL AND v_student.preferred_industry IS NOT NULL THEN
    SELECT ARRAY(SELECT jsonb_array_elements_text(p_filters->'industries')) INTO v_filter_industries;
    IF v_student.preferred_industry = ANY(v_filter_industries) THEN
      v_score := v_score + 20;
    END IF;
  END IF;
  
  -- Has resume bonus (10 points)
  IF v_student.resume_url IS NOT NULL THEN
    v_score := v_score + 10;
  END IF;
  
  RETURN LEAST(100, v_score);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. HELPER FUNCTION: Calculate match reasons for sponsor
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_match_reasons_for_sponsor(
  p_student_id uuid,
  p_filters jsonb
)
RETURNS jsonb AS $$
DECLARE
  v_reasons text[] := ARRAY[]::text[];
  v_student record;
  v_filter_majors text[];
  v_filter_skills text[];
  v_filter_industries text[];
BEGIN
  -- Get student data
  SELECT major, skills, preferred_industry, resume_url
  INTO v_student
  FROM users
  WHERE id = p_student_id;
  
  IF NOT FOUND THEN
    RETURN '[]'::jsonb;
  END IF;
  
  -- Check major match
  IF p_filters->'majors' IS NOT NULL AND v_student.major IS NOT NULL THEN
    SELECT ARRAY(SELECT jsonb_array_elements_text(p_filters->'majors')) INTO v_filter_majors;
    IF v_student.major = ANY(v_filter_majors) THEN
      v_reasons := array_append(v_reasons, 'Same major: ' || v_student.major);
    END IF;
  END IF;
  
  -- Check skills match
  IF p_filters->'skills' IS NOT NULL AND v_student.skills IS NOT NULL THEN
    SELECT ARRAY(SELECT jsonb_array_elements_text(p_filters->'skills')) INTO v_filter_skills;
    SELECT array_agg(skill) INTO v_reasons
    FROM (
      SELECT unnest(v_student.skills) AS skill
      INTERSECT
      SELECT unnest(v_filter_skills)
    ) AS matched_skills;
    
    IF array_length(v_reasons, 1) > 0 THEN
      v_reasons := array_append(v_reasons, 'Matching skills: ' || array_to_string(v_reasons, ', '));
    END IF;
  END IF;
  
  -- Check industry match
  IF p_filters->'industries' IS NOT NULL AND v_student.preferred_industry IS NOT NULL THEN
    SELECT ARRAY(SELECT jsonb_array_elements_text(p_filters->'industries')) INTO v_filter_industries;
    IF v_student.preferred_industry = ANY(v_filter_industries) THEN
      v_reasons := array_append(v_reasons, 'Preferred industry: ' || v_student.preferred_industry);
    END IF;
  END IF;
  
  -- Has resume
  IF v_student.resume_url IS NOT NULL THEN
    v_reasons := array_append(v_reasons, 'Resume available');
  END IF;
  
  RETURN to_jsonb(v_reasons);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. RLS POLICIES
-- ============================================================================

ALTER TABLE re_engagement_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_student_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_digests ENABLE ROW LEVEL SECURITY;

-- Users can view their own re-engagement campaigns
CREATE POLICY "Users can view own re-engagement campaigns" 
  ON re_engagement_campaigns FOR SELECT
  USING (auth.uid() = user_id);

-- Sponsors can view their own matches
CREATE POLICY "Sponsors can view own matches" 
  ON sponsor_student_matches FOR SELECT
  USING (auth.uid() = sponsor_id);

-- Sponsors can view their own digests
CREATE POLICY "Sponsors can view own digests" 
  ON sponsor_digests FOR SELECT
  USING (auth.uid() = sponsor_id);

-- Admins can view all
CREATE POLICY "Admins can view all re-engagement campaigns" 
  ON re_engagement_campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all sponsor matches" 
  ON sponsor_student_matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all sponsor digests" 
  ON sponsor_digests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 9. COMMENTS
-- ============================================================================

COMMENT ON FUNCTION get_inactive_users IS 'Returns students who haven''t registered for events in specified days';
COMMENT ON FUNCTION get_matching_students_for_sponsor IS 'Returns students matching sponsor criteria that haven''t been notified recently';
COMMENT ON FUNCTION calculate_match_score_for_sponsor IS 'Calculates match score (0-100) between student and sponsor filters';
COMMENT ON FUNCTION calculate_match_reasons_for_sponsor IS 'Returns array of reasons why student matches sponsor';

