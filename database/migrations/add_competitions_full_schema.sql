-- Complete Case Competitions Schema
-- Run this in Supabase SQL Editor to add full competition system

-- Add columns to case_competitions for full functionality
ALTER TABLE case_competitions 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS deadline timestamptz,
ADD COLUMN IF NOT EXISTS submission_instructions text,
ADD COLUMN IF NOT EXISTS max_team_size integer DEFAULT 4,
ADD COLUMN IF NOT EXISTS min_team_size integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'open', -- open, closed, judging, completed
ADD COLUMN IF NOT EXISTS results_published boolean DEFAULT false;

-- Add columns to teams for submissions
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS submission_url text,
ADD COLUMN IF NOT EXISTS submission_filename text,
ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
ADD COLUMN IF NOT EXISTS team_leader_id uuid REFERENCES users(id);

-- Create rubrics table for judging criteria
CREATE TABLE IF NOT EXISTS competition_rubrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES case_competitions(id) ON DELETE CASCADE,
  criterion text NOT NULL,
  description text,
  max_score integer DEFAULT 10,
  weight numeric DEFAULT 1.0,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create scores table for judging
CREATE TABLE IF NOT EXISTS competition_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  judge_id uuid REFERENCES users(id) ON DELETE SET NULL,
  rubric_id uuid REFERENCES competition_rubrics(id) ON DELETE CASCADE,
  score numeric NOT NULL,
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (team_id, judge_id, rubric_id)
);

-- Create judge assignments table
CREATE TABLE IF NOT EXISTS competition_judges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES case_competitions(id) ON DELETE CASCADE,
  judge_id uuid REFERENCES users(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE (competition_id, judge_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_competition ON teams(competition_id);
CREATE INDEX IF NOT EXISTS idx_rubrics_competition ON competition_rubrics(competition_id);
CREATE INDEX IF NOT EXISTS idx_scores_team ON competition_scores(team_id);
CREATE INDEX IF NOT EXISTS idx_scores_judge ON competition_scores(judge_id);
CREATE INDEX IF NOT EXISTS idx_judges_competition ON competition_judges(competition_id);

