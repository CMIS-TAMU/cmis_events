-- ============================================================================
-- Mentorship Matching System - Database Schema
-- ============================================================================
-- This migration adds all tables needed for the mentorship matching system
-- Run this in Supabase SQL Editor after existing schema is set up
-- ============================================================================

-- ============================================================================
-- 1. Mentorship Profiles
-- ============================================================================
-- Stores extended profile information for students and mentors

CREATE TABLE IF NOT EXISTS mentorship_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_type text NOT NULL CHECK (profile_type IN ('student', 'mentor')),
  
  -- Student-specific fields
  major text,
  graduation_year integer,
  research_interests text[], -- Array of research interests
  career_goals text,
  technical_skills text[], -- Array of technical skills
  gpa numeric(3, 2),
  
  -- Mentor-specific fields
  industry text,
  organization text,
  job_designation text,
  tamu_graduation_year integer,
  location text,
  areas_of_expertise text[], -- Array of expertise areas
  max_mentees integer DEFAULT 3,
  current_mentees integer DEFAULT 0,
  
  -- Common fields
  communication_preferences text[], -- ['email', 'phone', 'zoom', 'in-person']
  meeting_frequency text, -- 'weekly', 'biweekly', 'monthly', 'as-needed'
  mentorship_type text, -- 'career', 'research', 'project', 'general'
  bio text,
  
  -- Availability & Preferences
  in_matching_pool boolean DEFAULT true,
  availability_status text DEFAULT 'active' CHECK (availability_status IN ('active', 'on-break', 'unavailable')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  UNIQUE (user_id, profile_type),
  CHECK (
    (profile_type = 'student' AND major IS NOT NULL) OR
    (profile_type = 'mentor' AND industry IS NOT NULL)
  )
);

-- Indexes for mentorship_profiles
CREATE INDEX IF NOT EXISTS idx_mentorship_profiles_user_id ON mentorship_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_profiles_type ON mentorship_profiles(profile_type);
CREATE INDEX IF NOT EXISTS idx_mentorship_profiles_matching_pool ON mentorship_profiles(in_matching_pool) WHERE in_matching_pool = true;
CREATE INDEX IF NOT EXISTS idx_mentorship_profiles_availability ON mentorship_profiles(availability_status) WHERE availability_status = 'active';

-- ============================================================================
-- 2. Match Batches
-- ============================================================================
-- Tracks the top 3 mentor recommendations sent to mentors

CREATE TABLE IF NOT EXISTS match_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id uuid, -- Reference to mentorship_requests if needed
  
  -- Top 3 mentors recommended
  mentor_1_id uuid REFERENCES users(id) ON DELETE SET NULL,
  mentor_1_score numeric(5, 2),
  mentor_1_selected boolean DEFAULT false,
  mentor_1_selected_at timestamptz,
  
  mentor_2_id uuid REFERENCES users(id) ON DELETE SET NULL,
  mentor_2_score numeric(5, 2),
  mentor_2_selected boolean DEFAULT false,
  mentor_2_selected_at timestamptz,
  
  mentor_3_id uuid REFERENCES users(id) ON DELETE SET NULL,
  mentor_3_score numeric(5, 2),
  mentor_3_selected boolean DEFAULT false,
  mentor_3_selected_at timestamptz,
  
  -- Status tracking
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'expired', 'cancelled')),
  selected_mentor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  selected_at timestamptz,
  
  -- Email tracking
  email_sent_at timestamptz,
  reminder_sent_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz, -- Auto-expire after 7 days if not claimed
  
  -- Match reasoning (stored as JSON for flexibility)
  match_reasoning jsonb DEFAULT '{}'::jsonb
);

-- Indexes for match_batches
CREATE INDEX IF NOT EXISTS idx_match_batches_student ON match_batches(student_id);
CREATE INDEX IF NOT EXISTS idx_match_batches_status ON match_batches(status);
CREATE INDEX IF NOT EXISTS idx_match_batches_mentor_1 ON match_batches(mentor_1_id);
CREATE INDEX IF NOT EXISTS idx_match_batches_mentor_2 ON match_batches(mentor_2_id);
CREATE INDEX IF NOT EXISTS idx_match_batches_mentor_3 ON match_batches(mentor_3_id);
CREATE INDEX IF NOT EXISTS idx_match_batches_created ON match_batches(created_at);

-- ============================================================================
-- 3. Matches (Active Mentor-Student Pairings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_batch_id uuid REFERENCES match_batches(id) ON DELETE SET NULL,
  
  -- Match details
  match_score numeric(5, 2), -- Overall compatibility score
  match_reasoning jsonb DEFAULT '{}'::jsonb, -- Detailed breakdown
  
  -- Status tracking
  status text DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'failed', 'dissolved')),
  
  -- Timestamps
  matched_at timestamptz DEFAULT now(),
  activated_at timestamptz,
  completed_at timestamptz,
  last_meeting_at timestamptz,
  next_meeting_scheduled_at timestamptz,
  
  -- Health tracking
  is_at_risk boolean DEFAULT false,
  at_risk_reason text,
  health_score integer DEFAULT 5 CHECK (health_score >= 1 AND health_score <= 5),
  
  -- Admin override
  created_by_admin boolean DEFAULT false,
  admin_notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CHECK (student_id != mentor_id)
);

-- Indexes for matches
CREATE INDEX IF NOT EXISTS idx_matches_student ON matches(student_id);
CREATE INDEX IF NOT EXISTS idx_matches_mentor ON matches(mentor_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_at_risk ON matches(is_at_risk) WHERE is_at_risk = true;
CREATE INDEX IF NOT EXISTS idx_matches_last_meeting ON matches(last_meeting_at);

-- Partial unique index: Ensure a student can only have one active match at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_unique_active_student 
ON matches(student_id) 
WHERE status = 'active';

-- ============================================================================
-- 4. Mentorship Feedback
-- ============================================================================

CREATE TABLE IF NOT EXISTS mentorship_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  feedback_from_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Student or Mentor
  feedback_about_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- The other person in the match
  
  -- Feedback details
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  
  -- Feedback type
  feedback_type text DEFAULT 'general' CHECK (feedback_type IN ('general', 'match-quality', 'session', 'final')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  
  -- Constraints
  UNIQUE (match_id, feedback_from_id, feedback_type)
);

-- Indexes for mentorship_feedback
CREATE INDEX IF NOT EXISTS idx_mentorship_feedback_match ON mentorship_feedback(match_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_feedback_from ON mentorship_feedback(feedback_from_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_feedback_rating ON mentorship_feedback(rating);

-- ============================================================================
-- 5. Quick Questions (Micro-Mentoring Marketplace)
-- ============================================================================

CREATE TABLE IF NOT EXISTS quick_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Question details
  title text NOT NULL,
  description text NOT NULL,
  tags text[], -- ['resume-review', 'interview-prep', 'technical', 'career-advice']
  
  -- Preferences
  preferred_response_time text DEFAULT '48-hours' CHECK (preferred_response_time IN ('24-hours', '48-hours', '1-week')),
  
  -- Status tracking
  status text DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'in-progress', 'completed', 'cancelled')),
  
  -- Assignment
  claimed_by_mentor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  claimed_at timestamptz,
  completed_at timestamptz,
  
  -- Session tracking
  session_scheduled_at timestamptz,
  session_duration_minutes integer,
  
  -- Ratings
  student_rating integer CHECK (student_rating >= 1 AND student_rating <= 5),
  mentor_rating integer CHECK (mentor_rating >= 1 AND mentor_rating <= 5),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz -- Auto-expire if not claimed within timeframe
);

-- Indexes for quick_questions
CREATE INDEX IF NOT EXISTS idx_quick_questions_student ON quick_questions(student_id);
CREATE INDEX IF NOT EXISTS idx_quick_questions_status ON quick_questions(status);
CREATE INDEX IF NOT EXISTS idx_quick_questions_mentor ON quick_questions(claimed_by_mentor_id);
CREATE INDEX IF NOT EXISTS idx_quick_questions_tags ON quick_questions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_quick_questions_created ON quick_questions(created_at);

-- ============================================================================
-- 6. Meeting Logs
-- ============================================================================

CREATE TABLE IF NOT EXISTS meeting_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  
  -- Meeting details
  meeting_date timestamptz NOT NULL,
  duration_minutes integer,
  meeting_type text DEFAULT 'virtual' CHECK (meeting_type IN ('virtual', 'in-person', 'phone', 'email')),
  
  -- Meeting notes
  agenda text,
  discussion_points text[],
  action_items text[],
  student_notes text,
  mentor_notes text,
  
  -- Created by
  logged_by_id uuid NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for meeting_logs
CREATE INDEX IF NOT EXISTS idx_meeting_logs_match ON meeting_logs(match_id);
CREATE INDEX IF NOT EXISTS idx_meeting_logs_date ON meeting_logs(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meeting_logs_created ON meeting_logs(created_at);

-- ============================================================================
-- 7. Mentorship Requests (Optional - for tracking student requests)
-- ============================================================================

CREATE TABLE IF NOT EXISTS mentorship_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Request details
  requested_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'matched', 'failed', 'cancelled')),
  
  -- Preferences for this specific request (can override profile defaults)
  preferred_mentorship_type text,
  preferred_industry text[],
  preferred_communication_method text[],
  
  -- Result tracking
  match_batch_id uuid REFERENCES match_batches(id) ON DELETE SET NULL,
  matched_with_id uuid REFERENCES users(id) ON DELETE SET NULL,
  
  -- Notes
  student_notes text,
  admin_notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for mentorship_requests
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_student ON mentorship_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_status ON mentorship_requests(status);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_created ON mentorship_requests(created_at);

-- ============================================================================
-- 8. Helper Functions
-- ============================================================================

-- Function to update mentor's current_mentees count
CREATE OR REPLACE FUNCTION update_mentor_mentee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE mentorship_profiles
    SET current_mentees = current_mentees + 1
    WHERE user_id = NEW.mentor_id AND profile_type = 'mentor';
  ELSIF TG_OP = 'UPDATE' THEN
    -- If status changed from active to something else
    IF OLD.status = 'active' AND NEW.status != 'active' THEN
      UPDATE mentorship_profiles
      SET current_mentees = GREATEST(0, current_mentees - 1)
      WHERE user_id = NEW.mentor_id AND profile_type = 'mentor';
    -- If status changed to active
    ELSIF OLD.status != 'active' AND NEW.status = 'active' THEN
      UPDATE mentorship_profiles
      SET current_mentees = current_mentees + 1
      WHERE user_id = NEW.mentor_id AND profile_type = 'mentor';
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    UPDATE mentorship_profiles
    SET current_mentees = GREATEST(0, current_mentees - 1)
    WHERE user_id = OLD.mentor_id AND profile_type = 'mentor';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update mentor mentee counts
DROP TRIGGER IF EXISTS trigger_update_mentor_mentee_count ON matches;
CREATE TRIGGER trigger_update_mentor_mentee_count
  AFTER INSERT OR UPDATE OR DELETE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_mentor_mentee_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_mentorship_profiles_updated_at
  BEFORE UPDATE ON mentorship_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quick_questions_updated_at
  BEFORE UPDATE ON quick_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_logs_updated_at
  BEFORE UPDATE ON meeting_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentorship_requests_updated_at
  BEFORE UPDATE ON mentorship_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. Add mentorship role to users table metadata
-- ============================================================================
-- Users can have role 'student' or 'mentor' in addition to existing roles
-- The mentorship_profiles table tracks mentorship-specific data

-- ============================================================================
-- 10. Comments for Documentation
-- ============================================================================

COMMENT ON TABLE mentorship_profiles IS 'Extended profiles for students and mentors in the mentorship program';
COMMENT ON TABLE match_batches IS 'Top 3 mentor recommendations sent to mentors for selection';
COMMENT ON TABLE matches IS 'Active mentor-student pairings with status tracking';
COMMENT ON TABLE mentorship_feedback IS 'Feedback and ratings from mentorships';
COMMENT ON TABLE quick_questions IS 'Micro-mentoring marketplace for quick questions';
COMMENT ON TABLE meeting_logs IS 'Logs of meetings between mentors and students';
COMMENT ON TABLE mentorship_requests IS 'Student requests for mentorship matching';

COMMENT ON COLUMN matches.match_reasoning IS 'JSON object with breakdown of match score (career_goals, industry, research_interests, etc.)';
COMMENT ON COLUMN match_batches.match_reasoning IS 'JSON object explaining why these mentors were selected';
COMMENT ON COLUMN matches.health_score IS '1-5 scale: 5=excellent, 4=good, 3=moderate, 2=poor, 1=critical';

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Next steps:
-- 1. Set up Row-Level Security (RLS) policies
-- 2. Create matching algorithm function
-- 3. Set up email triggers
-- 4. Create cron jobs for health monitoring

