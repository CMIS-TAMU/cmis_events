-- Newsletter Subscriptions Table
-- Stores email subscriptions for mentors, sponsors, and students

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text,
  role text NOT NULL CHECK (role IN ('student', 'mentor', 'sponsor', 'general')),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  is_active boolean DEFAULT true,
  source text DEFAULT 'website', -- website, event, import, etc.
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(email)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_role ON newsletter_subscriptions(role);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_active ON newsletter_subscriptions(is_active);

-- RLS Policies
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert their own subscription (public)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscriptions FOR INSERT
  WITH CHECK (true);

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON newsletter_subscriptions FOR SELECT
  USING (
    email = current_setting('request.jwt.claims', true)::json->>'email'
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON newsletter_subscriptions FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Admins can update subscriptions
CREATE POLICY "Admins can update subscriptions"
  ON newsletter_subscriptions FOR UPDATE
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Users can update their own subscription (unsubscribe)
CREATE POLICY "Users can update own subscription"
  ON newsletter_subscriptions FOR UPDATE
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

