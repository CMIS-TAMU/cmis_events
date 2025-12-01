-- Migration: Add resume fields to users table
-- Run this in Supabase SQL Editor

-- Add resume-related columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS resume_url text,
ADD COLUMN IF NOT EXISTS resume_filename text,
ADD COLUMN IF NOT EXISTS resume_uploaded_at timestamptz,
ADD COLUMN IF NOT EXISTS major text,
ADD COLUMN IF NOT EXISTS gpa numeric(3, 2),
ADD COLUMN IF NOT EXISTS skills text[],
ADD COLUMN IF NOT EXISTS graduation_year integer,
ADD COLUMN IF NOT EXISTS resume_version integer DEFAULT 1;

-- Create index for faster resume searches
CREATE INDEX IF NOT EXISTS idx_users_major ON users(major);
CREATE INDEX IF NOT EXISTS idx_users_skills ON users USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_users_graduation_year ON users(graduation_year);

-- Create resume view tracking table (for analytics)
CREATE TABLE IF NOT EXISTS resume_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  viewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  viewed_at timestamptz DEFAULT now(),
  event_id uuid REFERENCES events(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_resume_views_user_id ON resume_views(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_views_viewed_by ON resume_views(viewed_by);

