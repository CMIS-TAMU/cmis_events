-- ============================================================================
-- AUTOMATED EMAIL COMMUNICATION SYSTEM - Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. COMMUNICATION TEMPLATES
-- ============================================================================
CREATE TABLE IF NOT EXISTS communication_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('email', 'sms', 'social')),
  channel text,
  subject text,
  body text NOT NULL,
  variables jsonb DEFAULT '{}'::jsonb,
  target_audience text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 2. COMMUNICATION SCHEDULES
-- ============================================================================
CREATE TABLE IF NOT EXISTS communication_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES communication_templates(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  trigger_type text NOT NULL,
  trigger_condition jsonb DEFAULT '{}'::jsonb,
  schedule_time timestamptz,
  recurrence text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  last_sent_at timestamptz,
  next_send_at timestamptz,
  recipient_filter jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. COMMUNICATION QUEUE
-- ============================================================================
CREATE TABLE IF NOT EXISTS communication_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES communication_templates(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  scheduled_for timestamptz NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  priority integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 4. COMMUNICATION LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS communication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid REFERENCES communication_schedules(id) ON DELETE SET NULL,
  template_id uuid REFERENCES communication_templates(id) ON DELETE SET NULL,
  recipient_id uuid REFERENCES users(id) ON DELETE SET NULL,
  channel text NOT NULL,
  status text NOT NULL CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  sent_at timestamptz DEFAULT now(),
  opened_at timestamptz,
  clicked_at timestamptz,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- ============================================================================
-- 5. SPONSOR TIERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS sponsor_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tier_level text NOT NULL CHECK (tier_level IN ('premium', 'standard', 'basic')),
  notification_frequency text,
  custom_filters jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 6. COMMUNICATION PREFERENCES
-- ============================================================================
CREATE TABLE IF NOT EXISTS communication_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT false,
  unsubscribe_categories text[] DEFAULT '{}',
  preferred_time_windows jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 7. EMAIL TEMPLATE VARIATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_template_variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES communication_templates(id) ON DELETE CASCADE NOT NULL,
  variation_type text NOT NULL CHECK (variation_type IN ('subject', 'greeting', 'body', 'closing')),
  content text NOT NULL,
  weight numeric(3, 2) DEFAULT 1.0,
  is_active boolean DEFAULT true
);

-- ============================================================================
-- 8. SURGE MODE CONFIG
-- ============================================================================
CREATE TABLE IF NOT EXISTS surge_mode_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active boolean DEFAULT false,
  threshold_registrations_per_hour integer DEFAULT 10,
  batch_interval_hours integer DEFAULT 1,
  max_emails_per_recipient_per_day integer DEFAULT 5,
  active_date_ranges jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Communication Templates
CREATE INDEX IF NOT EXISTS idx_communication_templates_type ON communication_templates(type);
CREATE INDEX IF NOT EXISTS idx_communication_templates_is_active ON communication_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_communication_templates_created_by ON communication_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_communication_templates_created_at ON communication_templates(created_at DESC);

-- Communication Schedules
CREATE INDEX IF NOT EXISTS idx_communication_schedules_template_id ON communication_schedules(template_id);
CREATE INDEX IF NOT EXISTS idx_communication_schedules_event_id ON communication_schedules(event_id);
CREATE INDEX IF NOT EXISTS idx_communication_schedules_status ON communication_schedules(status);
CREATE INDEX IF NOT EXISTS idx_communication_schedules_next_send_at ON communication_schedules(next_send_at) WHERE next_send_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_communication_schedules_trigger_type ON communication_schedules(trigger_type);

-- Communication Queue
CREATE INDEX IF NOT EXISTS idx_communication_queue_template_id ON communication_queue(template_id);
CREATE INDEX IF NOT EXISTS idx_communication_queue_recipient_id ON communication_queue(recipient_id);
CREATE INDEX IF NOT EXISTS idx_communication_queue_status ON communication_queue(status);
CREATE INDEX IF NOT EXISTS idx_communication_queue_scheduled_for ON communication_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_communication_queue_priority ON communication_queue(priority DESC, scheduled_for ASC);

-- Communication Logs
CREATE INDEX IF NOT EXISTS idx_communication_logs_schedule_id ON communication_logs(schedule_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_template_id ON communication_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_recipient_id ON communication_logs(recipient_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_status ON communication_logs(status);
CREATE INDEX IF NOT EXISTS idx_communication_logs_sent_at ON communication_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_communication_logs_channel ON communication_logs(channel);

-- Sponsor Tiers
CREATE INDEX IF NOT EXISTS idx_sponsor_tiers_user_id ON sponsor_tiers(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_tiers_tier_level ON sponsor_tiers(tier_level);

-- Communication Preferences
CREATE INDEX IF NOT EXISTS idx_communication_preferences_user_id ON communication_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_preferences_email_enabled ON communication_preferences(email_enabled);
CREATE INDEX IF NOT EXISTS idx_communication_preferences_sms_enabled ON communication_preferences(sms_enabled);

-- Email Template Variations
CREATE INDEX IF NOT EXISTS idx_email_template_variations_template_id ON email_template_variations(template_id);
CREATE INDEX IF NOT EXISTS idx_email_template_variations_variation_type ON email_template_variations(variation_type);
CREATE INDEX IF NOT EXISTS idx_email_template_variations_is_active ON email_template_variations(is_active);

-- Surge Mode Config
CREATE INDEX IF NOT EXISTS idx_surge_mode_config_is_active ON surge_mode_config(is_active);

-- ============================================================================
-- 10. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_template_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE surge_mode_config ENABLE ROW LEVEL SECURITY;

-- Communication Templates: Admins can manage all, creators can manage their own
CREATE POLICY "Admins can manage all templates"
  ON communication_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view active templates"
  ON communication_templates
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Creators can manage their templates"
  ON communication_templates
  FOR ALL
  USING (created_by = auth.uid());

-- Communication Schedules: Admins can manage all
CREATE POLICY "Admins can manage all schedules"
  ON communication_schedules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Communication Queue: Admins can view all, system can manage
CREATE POLICY "Admins can view queue"
  ON communication_queue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own queue items"
  ON communication_queue
  FOR SELECT
  USING (recipient_id = auth.uid());

-- Communication Logs: Admins can view all, users can view their own
CREATE POLICY "Admins can view all logs"
  ON communication_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own logs"
  ON communication_logs
  FOR SELECT
  USING (recipient_id = auth.uid());

-- Sponsor Tiers: Users can view their own, admins can manage all
CREATE POLICY "Users can view their own tier"
  ON sponsor_tiers
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all tiers"
  ON sponsor_tiers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Communication Preferences: Users can manage their own
CREATE POLICY "Users can manage their own preferences"
  ON communication_preferences
  FOR ALL
  USING (user_id = auth.uid());

-- Email Template Variations: Same as templates
CREATE POLICY "Admins can manage all variations"
  ON email_template_variations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view active variations"
  ON email_template_variations
  FOR SELECT
  USING (is_active = true);

-- Surge Mode Config: Admins only
CREATE POLICY "Admins can manage surge mode config"
  ON surge_mode_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- 11. TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp (if not already exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers for tables with updated_at
CREATE TRIGGER update_communication_templates_updated_at
  BEFORE UPDATE ON communication_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsor_tiers_updated_at
  BEFORE UPDATE ON sponsor_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_preferences_updated_at
  BEFORE UPDATE ON communication_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surge_mode_config_updated_at
  BEFORE UPDATE ON surge_mode_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ✅ MIGRATION COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Verify all tables were created successfully
-- 2. Test RLS policies
-- 3. Create initial templates and configurations
-- 4. Set up communication queue processing jobs


