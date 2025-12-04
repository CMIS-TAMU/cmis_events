-- ============================================================================
-- Sponsor Stats Helper Functions
-- ============================================================================
-- Helper functions for updating sponsor engagement statistics
-- Run this after add_sponsor_tier_system.sql
-- ============================================================================

-- Function to increment sponsor stats atomically
CREATE OR REPLACE FUNCTION increment_sponsor_stat(
  p_sponsor_id uuid,
  p_stat_name text
) RETURNS void AS $$
BEGIN
  -- Ensure stats record exists
  INSERT INTO sponsor_engagement_stats (sponsor_id, month_period)
  VALUES (p_sponsor_id, to_char(now(), 'YYYY-MM'))
  ON CONFLICT (sponsor_id) DO NOTHING;

  -- Increment the specified stat
  CASE p_stat_name
    WHEN 'notifications_sent' THEN
      UPDATE sponsor_engagement_stats
      SET notifications_sent = notifications_sent + 1,
          last_notification_sent = now()
      WHERE sponsor_id = p_sponsor_id;
      
    WHEN 'notifications_opened' THEN
      UPDATE sponsor_engagement_stats
      SET notifications_opened = notifications_opened + 1
      WHERE sponsor_id = p_sponsor_id;
      
    WHEN 'notifications_clicked' THEN
      UPDATE sponsor_engagement_stats
      SET notifications_clicked = notifications_clicked + 1
      WHERE sponsor_id = p_sponsor_id;
      
    WHEN 'resumes_viewed' THEN
      UPDATE sponsor_engagement_stats
      SET resumes_viewed = resumes_viewed + 1,
          last_resume_viewed = now()
      WHERE sponsor_id = p_sponsor_id;
      
    WHEN 'resumes_downloaded' THEN
      UPDATE sponsor_engagement_stats
      SET resumes_downloaded = resumes_downloaded + 1
      WHERE sponsor_id = p_sponsor_id;
      
    WHEN 'students_contacted' THEN
      UPDATE sponsor_engagement_stats
      SET students_contacted = students_contacted + 1
      WHERE sponsor_id = p_sponsor_id;
      
    WHEN 'students_shortlisted' THEN
      UPDATE sponsor_engagement_stats
      SET students_shortlisted = students_shortlisted + 1
      WHERE sponsor_id = p_sponsor_id;
      
    WHEN 'current_month_exports' THEN
      UPDATE sponsor_engagement_stats
      SET current_month_exports = current_month_exports + 1
      WHERE sponsor_id = p_sponsor_id;
      
    WHEN 'current_month_api_calls' THEN
      UPDATE sponsor_engagement_stats
      SET current_month_api_calls = current_month_api_calls + 1
      WHERE sponsor_id = p_sponsor_id;
  END CASE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_sponsor_stat IS 'Atomically increment sponsor engagement statistics';

-- Function to update last login
CREATE OR REPLACE FUNCTION update_sponsor_last_login(
  p_sponsor_id uuid
) RETURNS void AS $$
BEGIN
  INSERT INTO sponsor_engagement_stats (sponsor_id, last_login, month_period)
  VALUES (p_sponsor_id, now(), to_char(now(), 'YYYY-MM'))
  ON CONFLICT (sponsor_id) DO UPDATE
  SET last_login = now();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_sponsor_last_login IS 'Update sponsor last login timestamp';

-- Function to check if sponsor has reached monthly export limit
CREATE OR REPLACE FUNCTION check_sponsor_export_limit(
  p_sponsor_id uuid
) RETURNS boolean AS $$
DECLARE
  v_tier text;
  v_current_exports integer;
  v_max_exports integer;
  v_current_month text;
  v_stats_month text;
BEGIN
  -- Get sponsor tier
  SELECT sponsor_tier INTO v_tier
  FROM users
  WHERE id = p_sponsor_id;
  
  -- Get max exports for tier
  CASE v_tier
    WHEN 'premium' THEN v_max_exports := -1; -- unlimited
    WHEN 'standard' THEN v_max_exports := 50;
    WHEN 'basic' THEN v_max_exports := 10;
    ELSE v_max_exports := 10;
  END CASE;
  
  -- Unlimited for premium
  IF v_max_exports = -1 THEN
    RETURN true;
  END IF;
  
  -- Get current month
  v_current_month := to_char(now(), 'YYYY-MM');
  
  -- Get current exports count
  SELECT 
    COALESCE(current_month_exports, 0),
    month_period
  INTO v_current_exports, v_stats_month
  FROM sponsor_engagement_stats
  WHERE sponsor_id = p_sponsor_id;
  
  -- Reset if new month
  IF v_stats_month IS NULL OR v_stats_month < v_current_month THEN
    UPDATE sponsor_engagement_stats
    SET current_month_exports = 0,
        month_period = v_current_month
    WHERE sponsor_id = p_sponsor_id;
    RETURN true;
  END IF;
  
  -- Check limit
  RETURN v_current_exports < v_max_exports;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_sponsor_export_limit IS 'Check if sponsor can export based on tier limits';

-- Function to check if sponsor has reached API limit
CREATE OR REPLACE FUNCTION check_sponsor_api_limit(
  p_sponsor_id uuid
) RETURNS boolean AS $$
DECLARE
  v_tier text;
  v_current_calls integer;
  v_max_calls integer := 1000; -- Default max per month
  v_current_month text;
  v_stats_month text;
BEGIN
  -- Get sponsor tier
  SELECT sponsor_tier INTO v_tier
  FROM users
  WHERE id = p_sponsor_id;
  
  -- Get max API calls for tier
  CASE v_tier
    WHEN 'premium' THEN v_max_calls := -1; -- unlimited
    WHEN 'standard' THEN v_max_calls := 5000;
    WHEN 'basic' THEN v_max_calls := 0; -- no API access
    ELSE v_max_calls := 0;
  END CASE;
  
  -- No API access for basic
  IF v_max_calls = 0 THEN
    RETURN false;
  END IF;
  
  -- Unlimited for premium
  IF v_max_calls = -1 THEN
    RETURN true;
  END IF;
  
  -- Get current month
  v_current_month := to_char(now(), 'YYYY-MM');
  
  -- Get current API calls count
  SELECT 
    COALESCE(current_month_api_calls, 0),
    month_period
  INTO v_current_calls, v_stats_month
  FROM sponsor_engagement_stats
  WHERE sponsor_id = p_sponsor_id;
  
  -- Reset if new month
  IF v_stats_month IS NULL OR v_stats_month < v_current_month THEN
    UPDATE sponsor_engagement_stats
    SET current_month_api_calls = 0,
        month_period = v_current_month
    WHERE sponsor_id = p_sponsor_id;
    RETURN true;
  END IF;
  
  -- Check limit
  RETURN v_current_calls < v_max_calls;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_sponsor_api_limit IS 'Check if sponsor can make API calls based on tier limits';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Sponsor stats functions created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Created functions:';
  RAISE NOTICE '  ✓ increment_sponsor_stat(uuid, text)';
  RAISE NOTICE '  ✓ update_sponsor_last_login(uuid)';
  RAISE NOTICE '  ✓ check_sponsor_export_limit(uuid)';
  RAISE NOTICE '  ✓ check_sponsor_api_limit(uuid)';
END $$;

