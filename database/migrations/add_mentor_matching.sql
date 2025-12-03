-- ============================================================================
-- MENTOR MATCHING SYSTEM - Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. MENTOR PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS mentor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  areas_of_expertise text[] DEFAULT '{}',
  industries text[] DEFAULT '{}',
  skills text[] DEFAULT '{}',
  preferred_help_types text[] DEFAULT '{}',
  availability_per_month integer DEFAULT 2,
  bio text,
  linkedin_url text,
  company text,
  job_title text,
  years_of_experience integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 2. MATCH BATCHES (Groups of students suggested to a mentor)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mentor_match_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'archived')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- ============================================================================
-- 3. MATCH CANDIDATES (Students in a batch)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mentor_match_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid REFERENCES mentor_match_batches(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  match_score numeric(5, 2),
  match_reasons jsonb DEFAULT '{}'::jsonb,
  mentor_response text CHECK (mentor_response IN ('accepted', 'passed', 'pending')) DEFAULT 'pending',
  mentor_notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (batch_id, student_id)
);

-- ============================================================================
-- 4. MENTORSHIP OFFERS (Pending offers to students)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mentorship_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  batch_id uuid REFERENCES mentor_match_batches(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  mentor_welcome_message text,
  preferred_contact_time text,
  student_response text CHECK (student_response IN ('accepted', 'declined')),
  student_response_at timestamptz,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- ============================================================================
-- 5. ACTIVE MENTORSHIPS
-- ============================================================================
CREATE TABLE IF NOT EXISTS mentorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  offer_id uuid REFERENCES mentorship_offers(id) ON DELETE SET NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'ended')),
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  goals text[] DEFAULT '{}',
  last_meeting_date timestamptz,
  next_meeting_date timestamptz,
  meeting_frequency text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 6. MENTORSHIP MEETINGS (Optional: Track meeting history)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mentorship_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorship_id uuid REFERENCES mentorships(id) ON DELETE CASCADE NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer,
  meeting_type text CHECK (meeting_type IN ('video_call', 'in_person', 'phone', 'email')),
  meeting_url text,
  notes text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 7. STUDENT PROFILES (Extended profile data for matching)
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  interests text[] DEFAULT '{}',
  career_goals text[] DEFAULT '{}',
  top_projects jsonb DEFAULT '[]'::jsonb,
  growth_activity_score integer DEFAULT 0,
  seeking_mentorship boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 8. ADD MENTOR FLAG TO USERS TABLE
-- ============================================================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_mentor boolean DEFAULT false;

-- ============================================================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_user_id ON mentor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_skills ON mentor_profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_expertise ON mentor_profiles USING GIN(areas_of_expertise);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_industries ON mentor_profiles USING GIN(industries);
CREATE INDEX IF NOT EXISTS idx_mentor_match_batches_mentor_id ON mentor_match_batches(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_match_batches_status ON mentor_match_batches(status);
CREATE INDEX IF NOT EXISTS idx_mentor_match_candidates_batch_id ON mentor_match_candidates(batch_id);
CREATE INDEX IF NOT EXISTS idx_mentor_match_candidates_student_id ON mentor_match_candidates(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_match_candidates_response ON mentor_match_candidates(mentor_response);
CREATE INDEX IF NOT EXISTS idx_mentorship_offers_mentor_id ON mentorship_offers(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_offers_student_id ON mentorship_offers(student_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_offers_status ON mentorship_offers(status);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentor_id ON mentorships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_student_id ON mentorships(student_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_status ON mentorships(status);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_interests ON student_profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_student_profiles_career_goals ON student_profiles USING GIN(career_goals);
CREATE INDEX IF NOT EXISTS idx_student_profiles_seeking_mentorship ON student_profiles(seeking_mentorship);

-- ============================================================================
-- 10. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_match_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_match_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Mentor profiles: Users can view/edit their own
CREATE POLICY "Users can view own mentor profile"
  ON mentor_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mentor profile"
  ON mentor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mentor profile"
  ON mentor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Match batches: Mentors can view their own batches
CREATE POLICY "Mentors can view their match batches"
  ON mentor_match_batches FOR SELECT
  USING (auth.uid() = mentor_id);

-- Match candidates: Mentors can view candidates in their batches
CREATE POLICY "Mentors can view their match candidates"
  ON mentor_match_candidates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mentor_match_batches
      WHERE mentor_match_batches.id = mentor_match_candidates.batch_id
      AND mentor_match_batches.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can update their match candidates"
  ON mentor_match_candidates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM mentor_match_batches
      WHERE mentor_match_batches.id = mentor_match_candidates.batch_id
      AND mentor_match_batches.mentor_id = auth.uid()
    )
  );

-- Mentorship offers: Students can view their offers, mentors can view their sent offers
CREATE POLICY "Students can view their offers"
  ON mentorship_offers FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Mentors can view their sent offers"
  ON mentorship_offers FOR SELECT
  USING (auth.uid() = mentor_id);

CREATE POLICY "Students can update their offers"
  ON mentorship_offers FOR UPDATE
  USING (auth.uid() = student_id);

-- Active mentorships: Both parties can view
CREATE POLICY "Mentors and students can view their mentorships"
  ON mentorships FOR SELECT
  USING (auth.uid() = mentor_id OR auth.uid() = student_id);

CREATE POLICY "Mentors and students can update their mentorships"
  ON mentorships FOR UPDATE
  USING (auth.uid() = mentor_id OR auth.uid() = student_id);

-- Meetings: Both parties can view/update
CREATE POLICY "Mentors and students can view meetings"
  ON mentorship_meetings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mentorships
      WHERE mentorships.id = mentorship_meetings.mentorship_id
      AND (mentorships.mentor_id = auth.uid() OR mentorships.student_id = auth.uid())
    )
  );

CREATE POLICY "Mentors and students can update meetings"
  ON mentorship_meetings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM mentorships
      WHERE mentorships.id = mentorship_meetings.mentorship_id
      AND (mentorships.mentor_id = auth.uid() OR mentorships.student_id = auth.uid())
    )
  );

-- Student profiles: Users can view/edit their own
CREATE POLICY "Users can view own student profile"
  ON student_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own student profile"
  ON student_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own student profile"
  ON student_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 11. TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_mentor_profiles_updated_at
  BEFORE UPDATE ON mentor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentorships_updated_at
  BEFORE UPDATE ON mentorships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentorship_meetings_updated_at
  BEFORE UPDATE ON mentorship_meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ✅ MIGRATION COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Test RLS policies with sample data
-- 2. Create tRPC routers
-- 3. Implement matching algorithm
-- 4. Build UI components

