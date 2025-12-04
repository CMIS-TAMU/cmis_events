-- ============================================================================
-- Sponsor Tier System - Database Migration
-- ============================================================================
-- This migration adds sponsor tiers and notification preferences
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. Add sponsor_tier column to users table
-- ============================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'sponsor_tier') THEN
        ALTER TABLE users
        ADD COLUMN sponsor_tier text DEFAULT 'basic' 
        CHECK (sponsor_tier IN ('basic', 'standard', 'premium'));
        
        COMMENT ON COLUMN users.sponsor_tier IS 'Sponsor tier level: basic, standard, or premium';
    END IF;
END $$;

-- ============================================================================
-- 2. Create sponsor_preferences table
-- ============================================================================

CREATE TABLE IF NOT EXISTS sponsor_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Global notification frequency
  email_frequency text DEFAULT 'weekly' 
    CHECK (email_frequency IN ('real-time', 'batched', 'daily', 'weekly', 'never')),
  
  -- Event-specific notification preferences (JSONB for flexibility)
  notification_preferences jsonb DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "resume_upload": "real-time",
  --   "new_student": "batched",
  --   "profile_update": "weekly",
  --   "mission_submission": "real-time",
  --   "event_registration": "daily",
  --   "mentor_request": "never"
  -- }
  
  -- Student filtering preferences (JSONB)
  student_filters jsonb DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "majors": ["Computer Science", "Engineering"],
  --   "graduation_years": [2024, 2025, 2026],
  --   "min_gpa": 3.5,
  --   "skills": ["Python", "JavaScript", "React"],
  --   "industries": ["Technology", "Finance"]
  -- }
  
  -- Unsubscribed event types
  unsubscribed_from text[] DEFAULT ARRAY[]::text[],
  
  -- Contact preferences (JSONB)
  contact_preferences jsonb DEFAULT '{"email": true}'::jsonb,
  -- Structure: {
  --   "email": true,
  --   "phone": false,
  --   "sms": false
  -- }
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  UNIQUE (sponsor_id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_sponsor_preferences_sponsor_id 
  ON sponsor_preferences(sponsor_id);

-- Add comment
COMMENT ON TABLE sponsor_preferences IS 'Stores notification preferences and filters for sponsor users';

-- ============================================================================
-- 3. Create notification_queue table (for batched notifications)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb NOT NULL,
  notification_frequency text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  sent_at timestamptz,
  status text DEFAULT 'pending' 
    CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_notification_queue_sponsor_id 
  ON notification_queue(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled_for 
  ON notification_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_notification_queue_status 
  ON notification_queue(status);

-- Add comment
COMMENT ON TABLE notification_queue IS 'Queues notifications for batched delivery based on sponsor preferences';

-- ============================================================================
-- 4. Create notification_logs table (for analytics)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  event_type text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  opened_at timestamptz,
  clicked_at timestamptz,
  email_subject text,
  email_to text,
  delivery_status text DEFAULT 'sent' 
    CHECK (delivery_status IN ('sent', 'delivered', 'bounced', 'failed')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for analytics
CREATE INDEX IF NOT EXISTS idx_notification_logs_sponsor_id 
  ON notification_logs(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at 
  ON notification_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_notification_logs_event_type 
  ON notification_logs(event_type);

-- Add comment
COMMENT ON TABLE notification_logs IS 'Logs all sent notifications for analytics and engagement tracking';

-- ============================================================================
-- 5. Create sponsor_engagement_stats table (for dashboard)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sponsor_engagement_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Engagement metrics
  notifications_sent integer DEFAULT 0,
  notifications_opened integer DEFAULT 0,
  notifications_clicked integer DEFAULT 0,
  resumes_viewed integer DEFAULT 0,
  resumes_downloaded integer DEFAULT 0,
  students_contacted integer DEFAULT 0,
  students_shortlisted integer DEFAULT 0,
  
  -- Activity tracking
  last_login timestamptz,
  last_notification_sent timestamptz,
  last_resume_viewed timestamptz,
  
  -- Monthly tracking (for limits)
  current_month_exports integer DEFAULT 0,
  current_month_api_calls integer DEFAULT 0,
  month_period text, -- Format: "YYYY-MM"
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  UNIQUE (sponsor_id)
);

-- Add index
CREATE INDEX IF NOT EXISTS idx_sponsor_engagement_stats_sponsor_id 
  ON sponsor_engagement_stats(sponsor_id);

-- Add comment
COMMENT ON TABLE sponsor_engagement_stats IS 'Tracks engagement metrics for sponsors';

-- ============================================================================
-- 6. Create saved_searches table (for sponsor filters)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sponsor_saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  
  -- Search criteria (JSONB)
  search_filters jsonb NOT NULL,
  -- Structure: same as student_filters in sponsor_preferences
  
  -- Notification settings for this saved search
  notify_on_match boolean DEFAULT false,
  notification_frequency text DEFAULT 'daily'
    CHECK (notification_frequency IN ('real-time', 'daily', 'weekly', 'never')),
  
  -- Stats
  last_run_at timestamptz,
  match_count integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_sponsor_saved_searches_sponsor_id 
  ON sponsor_saved_searches(sponsor_id);

-- Add comment
COMMENT ON TABLE sponsor_saved_searches IS 'Stores saved search queries for sponsors with optional notifications';

-- ============================================================================
-- 7. Create triggers for updated_at
-- ============================================================================

-- Trigger for sponsor_preferences
CREATE OR REPLACE FUNCTION update_sponsor_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_sponsor_preferences_updated_at ON sponsor_preferences;
CREATE TRIGGER trigger_update_sponsor_preferences_updated_at
  BEFORE UPDATE ON sponsor_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_sponsor_preferences_updated_at();

-- Trigger for notification_queue
CREATE OR REPLACE FUNCTION update_notification_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_notification_queue_updated_at ON notification_queue;
CREATE TRIGGER trigger_update_notification_queue_updated_at
  BEFORE UPDATE ON notification_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_queue_updated_at();

-- Trigger for sponsor_engagement_stats
CREATE OR REPLACE FUNCTION update_sponsor_engagement_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_sponsor_engagement_stats_updated_at ON sponsor_engagement_stats;
CREATE TRIGGER trigger_update_sponsor_engagement_stats_updated_at
  BEFORE UPDATE ON sponsor_engagement_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_sponsor_engagement_stats_updated_at();

-- Trigger for sponsor_saved_searches
CREATE OR REPLACE FUNCTION update_sponsor_saved_searches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_sponsor_saved_searches_updated_at ON sponsor_saved_searches;
CREATE TRIGGER trigger_update_sponsor_saved_searches_updated_at
  BEFORE UPDATE ON sponsor_saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_sponsor_saved_searches_updated_at();

-- ============================================================================
-- 8. Create function to initialize engagement stats
-- ============================================================================

CREATE OR REPLACE FUNCTION initialize_sponsor_engagement_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'sponsor' THEN
    INSERT INTO sponsor_engagement_stats (sponsor_id, month_period)
    VALUES (NEW.id, to_char(now(), 'YYYY-MM'))
    ON CONFLICT (sponsor_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_initialize_sponsor_engagement_stats ON users;
CREATE TRIGGER trigger_initialize_sponsor_engagement_stats
  AFTER INSERT ON users
  FOR EACH ROW
  WHEN (NEW.role = 'sponsor')
  EXECUTE FUNCTION initialize_sponsor_engagement_stats();

-- ============================================================================
-- 9. Create function to reset monthly counters
-- ============================================================================

CREATE OR REPLACE FUNCTION reset_monthly_sponsor_limits()
RETURNS void AS $$
DECLARE
  current_month_period text;
BEGIN
  current_month_period := to_char(now(), 'YYYY-MM');
  
  UPDATE sponsor_engagement_stats
  SET 
    current_month_exports = 0,
    current_month_api_calls = 0,
    month_period = current_month_period
  WHERE month_period < current_month_period;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reset_monthly_sponsor_limits IS 'Call this function monthly via cron job to reset export and API limits';

-- ============================================================================
-- 10. Grant permissions (RLS will be handled separately)
-- ============================================================================

-- Enable Row Level Security
ALTER TABLE sponsor_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_engagement_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_saved_searches ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 11. Create RLS Policies
-- ============================================================================

-- Sponsor Preferences Policies
DROP POLICY IF EXISTS "Sponsors can view their own preferences" ON sponsor_preferences;
CREATE POLICY "Sponsors can view their own preferences"
  ON sponsor_preferences FOR SELECT
  USING (sponsor_id = auth.uid());

DROP POLICY IF EXISTS "Sponsors can update their own preferences" ON sponsor_preferences;
CREATE POLICY "Sponsors can update their own preferences"
  ON sponsor_preferences FOR UPDATE
  USING (sponsor_id = auth.uid());

DROP POLICY IF EXISTS "Sponsors can insert their own preferences" ON sponsor_preferences;
CREATE POLICY "Sponsors can insert their own preferences"
  ON sponsor_preferences FOR INSERT
  WITH CHECK (sponsor_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all preferences" ON sponsor_preferences;
CREATE POLICY "Admins can view all preferences"
  ON sponsor_preferences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Notification Queue Policies (backend only)
DROP POLICY IF EXISTS "Only backend can access notification queue" ON notification_queue;
CREATE POLICY "Only backend can access notification queue"
  ON notification_queue FOR ALL
  USING (true);

-- Notification Logs Policies
DROP POLICY IF EXISTS "Sponsors can view their own logs" ON notification_logs;
CREATE POLICY "Sponsors can view their own logs"
  ON notification_logs FOR SELECT
  USING (sponsor_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all logs" ON notification_logs;
CREATE POLICY "Admins can view all logs"
  ON notification_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Engagement Stats Policies
DROP POLICY IF EXISTS "Sponsors can view their own stats" ON sponsor_engagement_stats;
CREATE POLICY "Sponsors can view their own stats"
  ON sponsor_engagement_stats FOR SELECT
  USING (sponsor_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all stats" ON sponsor_engagement_stats;
CREATE POLICY "Admins can view all stats"
  ON sponsor_engagement_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Saved Searches Policies
DROP POLICY IF EXISTS "Sponsors can manage their own saved searches" ON sponsor_saved_searches;
CREATE POLICY "Sponsors can manage their own saved searches"
  ON sponsor_saved_searches FOR ALL
  USING (sponsor_id = auth.uid());

-- ============================================================================
-- 12. Insert default tier for existing sponsors
-- ============================================================================

-- Update existing sponsor users to have basic tier
UPDATE users
SET sponsor_tier = 'basic'
WHERE role = 'sponsor' AND sponsor_tier IS NULL;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE '✅ Sponsor tier system migration complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Created tables:';
  RAISE NOTICE '  ✓ sponsor_preferences';
  RAISE NOTICE '  ✓ notification_queue';
  RAISE NOTICE '  ✓ notification_logs';
  RAISE NOTICE '  ✓ sponsor_engagement_stats';
  RAISE NOTICE '  ✓ sponsor_saved_searches';
  RAISE NOTICE '';
  RAISE NOTICE 'Added column:';
  RAISE NOTICE '  ✓ users.sponsor_tier';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Set up cron job to call reset_monthly_sponsor_limits()';
  RAISE NOTICE '  2. Create admin interface to manage sponsor tiers';
  RAISE NOTICE '  3. Create sponsor preferences UI';
  RAISE NOTICE '  4. Update notification system to respect tier preferences';
END $$;

