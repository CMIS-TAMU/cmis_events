-- ============================================================================
-- TECHNICAL MISSIONS/CHALLENGES SYSTEM - Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. MISSIONS (Technical Challenges)
-- ============================================================================
CREATE TABLE IF NOT EXISTS missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
  category text,
  tags text[] DEFAULT '{}',
  requirements text,
  starter_files_url text,
  submission_instructions text,
  max_points integer DEFAULT 100,
  time_limit_minutes integer,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  published_at timestamptz,
  deadline timestamptz,
  total_attempts integer DEFAULT 0,
  total_submissions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 2. MISSION SUBMISSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS mission_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  submission_url text,
  submission_files jsonb DEFAULT '[]'::jsonb,
  submission_text text,
  started_at timestamptz DEFAULT now(),
  submitted_at timestamptz,
  time_spent_minutes integer,
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'scored', 'rejected')),
  score numeric(5, 2),
  points_awarded integer DEFAULT 0,
  sponsor_feedback text,
  sponsor_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (mission_id, student_id)
);

-- ============================================================================
-- 3. MISSION INTERACTIONS (Track engagement)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mission_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  interaction_type text CHECK (interaction_type IN ('viewed', 'started', 'submitted', 'feedback_viewed')) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 4. STUDENT POINTS (Gamification)
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_points integer DEFAULT 0,
  missions_completed integer DEFAULT 0,
  missions_perfect_score integer DEFAULT 0,
  average_score numeric(5, 2) DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 5. POINT TRANSACTIONS (Audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS point_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  mission_id uuid REFERENCES missions(id) ON DELETE SET NULL,
  submission_id uuid REFERENCES mission_submissions(id) ON DELETE SET NULL,
  points integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_missions_sponsor_id ON missions(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_difficulty ON missions(difficulty);
CREATE INDEX IF NOT EXISTS idx_missions_category ON missions(category);
CREATE INDEX IF NOT EXISTS idx_missions_tags ON missions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_missions_published_at ON missions(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_mission_submissions_mission_id ON mission_submissions(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_submissions_student_id ON mission_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_mission_submissions_status ON mission_submissions(status);
CREATE INDEX IF NOT EXISTS idx_mission_submissions_score ON mission_submissions(score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_mission_submissions_submitted_at ON mission_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_mission_interactions_mission_id ON mission_interactions(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_interactions_user_id ON mission_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_interactions_type ON mission_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_student_points_user_id ON student_points(user_id);
CREATE INDEX IF NOT EXISTS idx_student_points_total_points ON student_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_mission_id ON point_transactions(mission_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);

-- ============================================================================
-- 7. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

-- Missions: Sponsors can create/view/edit their own
CREATE POLICY "Sponsors can create missions"
  ON missions FOR INSERT
  WITH CHECK (auth.uid() = sponsor_id);

CREATE POLICY "Sponsors can view their missions"
  ON missions FOR SELECT
  USING (auth.uid() = sponsor_id);

CREATE POLICY "Sponsors can update their missions"
  ON missions FOR UPDATE
  USING (auth.uid() = sponsor_id);

-- Students can view active missions
CREATE POLICY "Students can view active missions"
  ON missions FOR SELECT
  USING (status = 'active' OR status = 'closed');

-- Submissions: Students can create/view their own
CREATE POLICY "Students can create submissions"
  ON mission_submissions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their submissions"
  ON mission_submissions FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can update their submissions"
  ON mission_submissions FOR UPDATE
  USING (auth.uid() = student_id AND status = 'submitted');

-- Sponsors can view submissions for their missions
CREATE POLICY "Sponsors can view their mission submissions"
  ON mission_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM missions
      WHERE missions.id = mission_submissions.mission_id
      AND missions.sponsor_id = auth.uid()
    )
  );

CREATE POLICY "Sponsors can update their mission submissions"
  ON mission_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM missions
      WHERE missions.id = mission_submissions.mission_id
      AND missions.sponsor_id = auth.uid()
    )
  );

-- Interactions: Users can create/view their own
CREATE POLICY "Users can create interactions"
  ON mission_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their interactions"
  ON mission_interactions FOR SELECT
  USING (auth.uid() = user_id);

-- Student points: Users can view their own
CREATE POLICY "Users can view own points"
  ON student_points FOR SELECT
  USING (auth.uid() = user_id);

-- Public leaderboard: Anyone authenticated can view
CREATE POLICY "Users can view all points for leaderboard"
  ON student_points FOR SELECT
  USING (auth.role() = 'authenticated');

-- Point transactions: Users can view their own
CREATE POLICY "Users can view own transactions"
  ON point_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- 8. TRIGGERS FOR UPDATED_AT
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
CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON missions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mission_submissions_updated_at
  BEFORE UPDATE ON mission_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. FUNCTIONS FOR POINTS CALCULATION
-- ============================================================================

-- Function to calculate points based on score and difficulty
CREATE OR REPLACE FUNCTION calculate_mission_points(
  p_score numeric,
  p_difficulty text,
  p_max_points integer DEFAULT 100
)
RETURNS integer AS $$
DECLARE
  base_points numeric;
  difficulty_multiplier numeric;
  final_points integer;
BEGIN
  -- Base points calculation
  IF p_score <= 50 THEN
    base_points := p_score * 0.5;
  ELSIF p_score <= 75 THEN
    base_points := p_score * 0.75;
  ELSIF p_score < 100 THEN
    base_points := p_score * 1.0;
  ELSE
    -- Perfect score bonus
    base_points := p_max_points * 1.5;
  END IF;

  -- Difficulty multiplier
  CASE p_difficulty
    WHEN 'beginner' THEN difficulty_multiplier := 1.0;
    WHEN 'intermediate' THEN difficulty_multiplier := 1.2;
    WHEN 'advanced' THEN difficulty_multiplier := 1.5;
    WHEN 'expert' THEN difficulty_multiplier := 2.0;
    ELSE difficulty_multiplier := 1.0;
  END CASE;

  final_points := ROUND(base_points * difficulty_multiplier);
  
  RETURN final_points;
END;
$$ LANGUAGE plpgsql;

-- Function to update student points
CREATE OR REPLACE FUNCTION update_student_points(
  p_user_id uuid,
  p_points integer,
  p_score numeric
)
RETURNS void AS $$
BEGIN
  INSERT INTO student_points (user_id, total_points, missions_completed, average_score, last_updated)
  VALUES (p_user_id, p_points, 1, p_score, now())
  ON CONFLICT (user_id) DO UPDATE
  SET
    total_points = student_points.total_points + p_points,
    missions_completed = student_points.missions_completed + 1,
    missions_perfect_score = CASE 
      WHEN p_score = 100 THEN student_points.missions_perfect_score + 1 
      ELSE student_points.missions_perfect_score 
    END,
    average_score = (
      (student_points.average_score * student_points.missions_completed + p_score) / 
      (student_points.missions_completed + 1)
    ),
    last_updated = now();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. TRIGGER TO UPDATE MISSION STATS
-- ============================================================================

-- Function to update mission total_attempts and total_submissions
CREATE OR REPLACE FUNCTION update_mission_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment total_attempts when submission is created
    UPDATE missions
    SET total_attempts = total_attempts + 1
    WHERE id = NEW.mission_id;
    
    -- Increment total_submissions when submission is completed
    IF NEW.submitted_at IS NOT NULL THEN
      UPDATE missions
      SET total_submissions = total_submissions + 1
      WHERE id = NEW.mission_id;
    END IF;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    -- If submission was just completed
    IF OLD.submitted_at IS NULL AND NEW.submitted_at IS NOT NULL THEN
      UPDATE missions
      SET total_submissions = total_submissions + 1
      WHERE id = NEW.mission_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mission_stats_trigger
  AFTER INSERT OR UPDATE ON mission_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_mission_stats();

-- ============================================================================
-- ✅ MIGRATION COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Create Supabase Storage buckets:
--    - mission-starter-files (public or with RLS)
--    - mission-submissions (private, RLS enabled)
-- 2. Create tRPC router
-- 3. Implement points calculation logic
-- 4. Build UI components

