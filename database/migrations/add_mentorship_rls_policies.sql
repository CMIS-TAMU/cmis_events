-- ============================================================================
-- Mentorship Matching System - Row-Level Security (RLS) Policies
-- ============================================================================
-- Run this after the schema migration to set up security policies
-- ============================================================================

-- Enable RLS on all mentorship tables
ALTER TABLE mentorship_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 1. Mentorship Profiles Policies
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own mentorship profile"
  ON mentorship_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can create own mentorship profile"
  ON mentorship_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own mentorship profile"
  ON mentorship_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all mentorship profiles"
  ON mentorship_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Mentors can see student profiles in their match batches (limited fields)
CREATE POLICY "Mentors can see matched student profiles"
  ON mentorship_profiles
  FOR SELECT
  USING (
    profile_type = 'student' AND
    EXISTS (
      SELECT 1 FROM match_batches mb
      WHERE mb.student_id = mentorship_profiles.user_id
      AND (mb.mentor_1_id = auth.uid() OR mb.mentor_2_id = auth.uid() OR mb.mentor_3_id = auth.uid())
      AND mb.status = 'pending'
    )
  );

-- ============================================================================
-- 2. Match Batches Policies
-- ============================================================================

-- Students can read their own match batches
CREATE POLICY "Students can read own match batches"
  ON match_batches
  FOR SELECT
  USING (auth.uid() = student_id);

-- Students can create match batch requests (via service role only)
-- This will be handled via API with service role

-- Mentors can read match batches where they are recommended
CREATE POLICY "Mentors can read own match batches"
  ON match_batches
  FOR SELECT
  USING (
    auth.uid() = mentor_1_id OR
    auth.uid() = mentor_2_id OR
    auth.uid() = mentor_3_id
  );

-- Mentors can update match batches to select a student
CREATE POLICY "Mentors can select student in match batch"
  ON match_batches
  FOR UPDATE
  USING (
    (auth.uid() = mentor_1_id AND status = 'pending') OR
    (auth.uid() = mentor_2_id AND status = 'pending') OR
    (auth.uid() = mentor_3_id AND status = 'pending')
  )
  WITH CHECK (
    (auth.uid() = mentor_1_id AND mentor_1_selected = true) OR
    (auth.uid() = mentor_2_id AND mentor_2_selected = true) OR
    (auth.uid() = mentor_3_id AND mentor_3_selected = true)
  );

-- Admins can read all match batches
CREATE POLICY "Admins can read all match batches"
  ON match_batches
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Admins can update all match batches
CREATE POLICY "Admins can update all match batches"
  ON match_batches
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================================================
-- 3. Matches Policies
-- ============================================================================

-- Students can read their own matches
CREATE POLICY "Students can read own matches"
  ON matches
  FOR SELECT
  USING (auth.uid() = student_id);

-- Mentors can read their own matches
CREATE POLICY "Mentors can read own matches"
  ON matches
  FOR SELECT
  USING (auth.uid() = mentor_id);

-- Students and mentors can update their own matches (limited fields)
CREATE POLICY "Students and mentors can update own matches"
  ON matches
  FOR UPDATE
  USING (auth.uid() = student_id OR auth.uid() = mentor_id)
  WITH CHECK (auth.uid() = student_id OR auth.uid() = mentor_id);

-- Admins can read all matches
CREATE POLICY "Admins can read all matches"
  ON matches
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Admins can create/update/delete all matches
CREATE POLICY "Admins can manage all matches"
  ON matches
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================================================
-- 4. Mentorship Feedback Policies
-- ============================================================================

-- Users can read feedback about themselves
CREATE POLICY "Users can read feedback about them"
  ON mentorship_feedback
  FOR SELECT
  USING (auth.uid() = feedback_about_id);

-- Users can create feedback for their matches
CREATE POLICY "Users can create feedback for own matches"
  ON mentorship_feedback
  FOR INSERT
  WITH CHECK (
    auth.uid() = feedback_from_id AND
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = mentorship_feedback.match_id
      AND (matches.student_id = auth.uid() OR matches.mentor_id = auth.uid())
    )
  );

-- Users can update their own feedback
CREATE POLICY "Users can update own feedback"
  ON mentorship_feedback
  FOR UPDATE
  USING (auth.uid() = feedback_from_id)
  WITH CHECK (auth.uid() = feedback_from_id);

-- Admins can read all feedback
CREATE POLICY "Admins can read all feedback"
  ON mentorship_feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================================================
-- 5. Quick Questions Policies
-- ============================================================================

-- Students can read their own questions
CREATE POLICY "Students can read own questions"
  ON quick_questions
  FOR SELECT
  USING (auth.uid() = student_id);

-- Students can create questions
CREATE POLICY "Students can create questions"
  ON quick_questions
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own questions (before claimed)
CREATE POLICY "Students can update own questions"
  ON quick_questions
  FOR UPDATE
  USING (
    auth.uid() = student_id AND
    status IN ('open', 'cancelled')
  )
  WITH CHECK (auth.uid() = student_id);

-- Mentors can read open questions (for browsing)
CREATE POLICY "Mentors can read open questions"
  ON quick_questions
  FOR SELECT
  USING (status = 'open');

-- Mentors can read questions they claimed
CREATE POLICY "Mentors can read claimed questions"
  ON quick_questions
  FOR SELECT
  USING (auth.uid() = claimed_by_mentor_id);

-- Mentors can claim questions
CREATE POLICY "Mentors can claim questions"
  ON quick_questions
  FOR UPDATE
  USING (
    status = 'open' AND
    EXISTS (
      SELECT 1 FROM mentorship_profiles
      WHERE mentorship_profiles.user_id = auth.uid()
      AND mentorship_profiles.profile_type = 'mentor'
      AND mentorship_profiles.availability_status = 'active'
    )
  )
  WITH CHECK (
    auth.uid() = claimed_by_mentor_id AND
    status = 'claimed'
  );

-- Admins can read all questions
CREATE POLICY "Admins can read all questions"
  ON quick_questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================================================
-- 6. Meeting Logs Policies
-- ============================================================================

-- Users can read meeting logs for their matches
CREATE POLICY "Users can read own meeting logs"
  ON meeting_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = meeting_logs.match_id
      AND (matches.student_id = auth.uid() OR matches.mentor_id = auth.uid())
    )
  );

-- Users can create meeting logs for their matches
CREATE POLICY "Users can create meeting logs for own matches"
  ON meeting_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() = logged_by_id AND
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = meeting_logs.match_id
      AND (matches.student_id = auth.uid() OR matches.mentor_id = auth.uid())
    )
  );

-- Users can update their own logged meetings
CREATE POLICY "Users can update own logged meetings"
  ON meeting_logs
  FOR UPDATE
  USING (auth.uid() = logged_by_id)
  WITH CHECK (auth.uid() = logged_by_id);

-- Admins can read all meeting logs
CREATE POLICY "Admins can read all meeting logs"
  ON meeting_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================================================
-- 7. Mentorship Requests Policies
-- ============================================================================

-- Students can read their own requests
CREATE POLICY "Students can read own requests"
  ON mentorship_requests
  FOR SELECT
  USING (auth.uid() = student_id);

-- Students can create requests
CREATE POLICY "Students can create requests"
  ON mentorship_requests
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own requests (before matched)
CREATE POLICY "Students can update own requests"
  ON mentorship_requests
  FOR UPDATE
  USING (
    auth.uid() = student_id AND
    status IN ('pending', 'processing')
  )
  WITH CHECK (auth.uid() = student_id);

-- Admins can read all requests
CREATE POLICY "Admins can read all requests"
  ON mentorship_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Admins can update all requests
CREATE POLICY "Admins can update all requests"
  ON mentorship_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================================================
-- RLS Policies Complete
-- ============================================================================
-- Note: Some operations (like creating matches via matching algorithm)
-- will need to use service role key to bypass RLS for system operations

