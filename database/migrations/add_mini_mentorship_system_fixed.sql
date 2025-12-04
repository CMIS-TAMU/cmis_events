-- ============================================================================
-- Mini Mentorship System - Database Schema (IDEMPOTENT VERSION)
-- ============================================================================
-- This migration adds tables for mini mentorship (quick 30-60min sessions)
-- This version is safe to run multiple times (idempotent)
-- ============================================================================

-- Drop existing tables if they exist (use with caution in production!)
-- Comment out these lines if you want to preserve existing data
-- DROP TABLE IF EXISTS mini_mentorship_sessions CASCADE;
-- DROP TABLE IF EXISTS mini_mentorship_requests CASCADE;
-- DROP TABLE IF EXISTS mini_mentorship_availability CASCADE;

-- 1. Mini Session Requests (created by students)
CREATE TABLE IF NOT EXISTS mini_mentorship_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Request details
  title text NOT NULL, -- e.g., "Interview prep for Google SWE role"
  description text NOT NULL,
  session_type text NOT NULL CHECK (session_type IN (
    'interview_prep',
    'skill_learning', 
    'career_advice',
    'resume_review',
    'project_guidance',
    'technical_help',
    'portfolio_review',
    'networking_advice',
    'other'
  )),
  
  -- Session preferences
  preferred_duration_minutes integer DEFAULT 60 CHECK (preferred_duration_minutes IN (30, 45, 60)),
  urgency text DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  
  -- Availability (when student is available)
  preferred_date_start date, -- Earliest available date
  preferred_date_end date, -- Latest available date
  preferred_time_slots jsonb DEFAULT '[]'::jsonb, -- Array of time ranges
  timezone text DEFAULT 'America/Chicago',
  
  -- Additional context
  tags text[], -- ['technical-interview', 'google', 'software-engineering']
  relevant_experience text, -- What experience does student have?
  specific_questions text, -- Specific things they want to cover
  resume_url text, -- Link to resume if relevant
  portfolio_url text, -- Link to portfolio if relevant
  
  -- Status tracking
  status text DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'scheduled', 'completed', 'cancelled', 'expired')),
  
  -- Assignment
  claimed_by_mentor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  claimed_at timestamptz,
  
  -- Session details (filled when scheduled) - FK added after sessions table is created
  scheduled_session_id uuid,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz, -- Auto-expire after 7 days if not claimed
  updated_at timestamptz DEFAULT now()
);

-- Indexes for mini_mentorship_requests
CREATE INDEX IF NOT EXISTS idx_mini_requests_student ON mini_mentorship_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_mini_requests_status ON mini_mentorship_requests(status);
CREATE INDEX IF NOT EXISTS idx_mini_requests_type ON mini_mentorship_requests(session_type);
CREATE INDEX IF NOT EXISTS idx_mini_requests_mentor ON mini_mentorship_requests(claimed_by_mentor_id);
CREATE INDEX IF NOT EXISTS idx_mini_requests_tags ON mini_mentorship_requests USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_mini_requests_created ON mini_mentorship_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_mini_requests_expires ON mini_mentorship_requests(expires_at) WHERE status = 'open';

-- 2. Mini Mentorship Sessions (scheduled sessions)
CREATE TABLE IF NOT EXISTS mini_mentorship_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES mini_mentorship_requests(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Session scheduling
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes IN (30, 45, 60)),
  timezone text DEFAULT 'America/Chicago',
  
  -- Meeting details
  meeting_type text DEFAULT 'virtual' CHECK (meeting_type IN ('virtual', 'phone', 'in-person')),
  meeting_platform text DEFAULT 'zoom' CHECK (meeting_platform IN ('zoom', 'google-meet', 'teams', 'phone', 'other')),
  meeting_link text, -- Zoom/Google Meet link
  meeting_id text, -- Meeting ID if applicable
  meeting_passcode text, -- Passcode if applicable
  location text, -- Physical location if in-person
  
  -- Status tracking
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'no-show')),
  started_at timestamptz,
  ended_at timestamptz,
  actual_duration_minutes integer, -- Actual session duration
  
  -- Reminders
  reminder_24hr_sent_at timestamptz,
  reminder_1hr_sent_at timestamptz,
  
  -- Session notes (after completion)
  student_notes text,
  mentor_notes text,
  topics_covered text[],
  action_items text[],
  follow_up_needed boolean DEFAULT false,
  
  -- Ratings (after session)
  student_rating integer CHECK (student_rating >= 1 AND student_rating <= 5),
  student_feedback text,
  mentor_rating integer CHECK (mentor_rating >= 1 AND mentor_rating <= 5),
  mentor_feedback text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CHECK (student_id != mentor_id)
);

-- Add foreign key reference from requests to sessions (after both tables exist)
-- Drop constraint if it exists first (idempotent migration)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_scheduled_session' 
    AND conrelid = 'mini_mentorship_requests'::regclass
  ) THEN
    ALTER TABLE mini_mentorship_requests DROP CONSTRAINT fk_scheduled_session;
  END IF;
END $$;

-- Only add constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_scheduled_session' 
    AND conrelid = 'mini_mentorship_requests'::regclass
  ) THEN
    ALTER TABLE mini_mentorship_requests 
    ADD CONSTRAINT fk_scheduled_session 
    FOREIGN KEY (scheduled_session_id) 
    REFERENCES mini_mentorship_sessions(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Indexes for mini_mentorship_sessions
CREATE INDEX IF NOT EXISTS idx_mini_sessions_student ON mini_mentorship_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_mini_sessions_mentor ON mini_mentorship_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mini_sessions_status ON mini_mentorship_sessions(status);
CREATE INDEX IF NOT EXISTS idx_mini_sessions_scheduled ON mini_mentorship_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_mini_sessions_request ON mini_mentorship_sessions(request_id);

-- 3. Mini Mentorship Session Availability (for scheduling)
CREATE TABLE IF NOT EXISTS mini_mentorship_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Availability window
  available_from timestamptz NOT NULL,
  available_until timestamptz NOT NULL,
  timezone text DEFAULT 'America/Chicago',
  
  -- Status
  is_available boolean DEFAULT true,
  blocked_reason text, -- Why is this blocked?
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CHECK (available_until > available_from)
);

-- Indexes for availability
CREATE INDEX IF NOT EXISTS idx_mini_availability_mentor ON mini_mentorship_availability(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mini_availability_from ON mini_mentorship_availability(available_from);
CREATE INDEX IF NOT EXISTS idx_mini_availability_until ON mini_mentorship_availability(available_until);
CREATE INDEX IF NOT EXISTS idx_mini_availability_available ON mini_mentorship_availability(is_available) WHERE is_available = true;

-- ============================================================================
-- Row-Level Security (RLS) Policies (IDEMPOTENT)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE mini_mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mini_mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mini_mentorship_availability ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Students can view own requests" ON mini_mentorship_requests;
DROP POLICY IF EXISTS "Students can create requests" ON mini_mentorship_requests;
DROP POLICY IF EXISTS "Students can update own open requests" ON mini_mentorship_requests;
DROP POLICY IF EXISTS "Mentors can view open requests" ON mini_mentorship_requests;
DROP POLICY IF EXISTS "Mentors can claim requests" ON mini_mentorship_requests;

DROP POLICY IF EXISTS "Users can view own sessions" ON mini_mentorship_sessions;
DROP POLICY IF EXISTS "Mentors can create sessions" ON mini_mentorship_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON mini_mentorship_sessions;

DROP POLICY IF EXISTS "Mentors can manage own availability" ON mini_mentorship_availability;

-- Mini Mentorship Requests Policies

-- Students can view their own requests
CREATE POLICY "Students can view own requests"
  ON mini_mentorship_requests
  FOR SELECT
  USING (auth.uid() = student_id);

-- Students can create requests
CREATE POLICY "Students can create requests"
  ON mini_mentorship_requests
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own open requests
CREATE POLICY "Students can update own open requests"
  ON mini_mentorship_requests
  FOR UPDATE
  USING (
    auth.uid() = student_id AND 
    (status = 'open' OR status = 'claimed')
  );

-- Mentors can view open requests
CREATE POLICY "Mentors can view open requests"
  ON mini_mentorship_requests
  FOR SELECT
  USING (
    status = 'open' OR
    claimed_by_mentor_id = auth.uid()
  );

-- Mentors can claim requests (update)
CREATE POLICY "Mentors can claim requests"
  ON mini_mentorship_requests
  FOR UPDATE
  USING (
    status = 'open' AND
    EXISTS (
      SELECT 1 FROM mentorship_profiles
      WHERE user_id = auth.uid()
      AND profile_type = 'mentor'
      AND in_matching_pool = true
    )
  );

-- Mini Mentorship Sessions Policies

-- Students and mentors can view their sessions
CREATE POLICY "Users can view own sessions"
  ON mini_mentorship_sessions
  FOR SELECT
  USING (
    student_id = auth.uid() OR
    mentor_id = auth.uid()
  );

-- Only mentors can create sessions (when scheduling)
CREATE POLICY "Mentors can create sessions"
  ON mini_mentorship_sessions
  FOR INSERT
  WITH CHECK (
    mentor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM mentorship_profiles
      WHERE user_id = auth.uid()
      AND profile_type = 'mentor'
    )
  );

-- Students and mentors can update their sessions
CREATE POLICY "Users can update own sessions"
  ON mini_mentorship_sessions
  FOR UPDATE
  USING (
    student_id = auth.uid() OR
    mentor_id = auth.uid()
  );

-- Mini Mentorship Availability Policies

-- Mentors can manage their own availability
CREATE POLICY "Mentors can manage own availability"
  ON mini_mentorship_availability
  FOR ALL
  USING (
    mentor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM mentorship_profiles
      WHERE user_id = auth.uid()
      AND profile_type = 'mentor'
    )
  );

-- ============================================================================
-- Helper Functions (IDEMPOTENT)
-- ============================================================================

-- Function to auto-expire open requests after 7 days
CREATE OR REPLACE FUNCTION expire_old_mini_requests()
RETURNS void AS $$
BEGIN
  UPDATE mini_mentorship_requests
  SET status = 'expired', updated_at = now()
  WHERE status = 'open'
    AND expires_at IS NOT NULL
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Function to set expires_at when request is created
CREATE OR REPLACE FUNCTION set_mini_request_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NEW.created_at + INTERVAL '7 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS set_mini_request_expiry_trigger ON mini_mentorship_requests;

-- Trigger to auto-set expiry date
CREATE TRIGGER set_mini_request_expiry_trigger
  BEFORE INSERT ON mini_mentorship_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_mini_request_expiry();

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE mini_mentorship_requests IS 'Student requests for quick 30-60min mentorship sessions';
COMMENT ON TABLE mini_mentorship_sessions IS 'Scheduled and completed mini mentorship sessions';
COMMENT ON TABLE mini_mentorship_availability IS 'Mentor availability windows for scheduling mini sessions';

COMMENT ON COLUMN mini_mentorship_requests.session_type IS 'Type of session: interview_prep, skill_learning, career_advice, etc.';
COMMENT ON COLUMN mini_mentorship_requests.preferred_time_slots IS 'JSON array of preferred time ranges: [{"start": "09:00", "end": "17:00", "days": ["Monday", "Wednesday"]}]';
COMMENT ON COLUMN mini_mentorship_sessions.meeting_link IS 'Generated Zoom/Google Meet link for the session';

