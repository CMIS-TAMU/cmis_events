-- ============================================================================
-- Migration: Add Enhanced Student Profile Fields
-- ============================================================================
-- This migration adds contact details, preferred industry, work experience,
-- and education history fields to the users table for enhanced student profiles
-- ============================================================================
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Add contact information columns
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS github_url text,
ADD COLUMN IF NOT EXISTS website_url text,
ADD COLUMN IF NOT EXISTS address text;

-- Add student-specific fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS preferred_industry text,
ADD COLUMN IF NOT EXISTS degree_type text CHECK (degree_type IN ('bachelor', 'master', 'phd', 'associate', 'certificate') OR degree_type IS NULL);

-- Add work experience (stored as JSONB array for flexibility)
-- Structure: [{
--   "id": "uuid",
--   "company": "string",
--   "position": "string",
--   "start_date": "YYYY-MM-DD",
--   "end_date": "YYYY-MM-DD" | null (for current),
--   "description": "string",
--   "is_current": boolean,
--   "location": "string" (optional)
-- }]
ALTER TABLE users
ADD COLUMN IF NOT EXISTS work_experience jsonb DEFAULT '[]'::jsonb;

-- Add education history (stored as JSONB array)
-- Structure: [{
--   "id": "uuid",
--   "institution": "string",
--   "degree": "string",
--   "field_of_study": "string",
--   "start_date": "YYYY-MM-DD",
--   "end_date": "YYYY-MM-DD" | null (for current),
--   "gpa": numeric,
--   "is_current": boolean,
--   "location": "string" (optional)
-- }]
ALTER TABLE users
ADD COLUMN IF NOT EXISTS education jsonb DEFAULT '[]'::jsonb;

-- Add updated_at column if it doesn't exist (for tracking profile updates)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_linkedin ON users(linkedin_url) WHERE linkedin_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_preferred_industry ON users(preferred_industry) WHERE preferred_industry IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_degree_type ON users(degree_type) WHERE degree_type IS NOT NULL;

-- Create GIN index for JSONB fields (for faster JSONB queries)
CREATE INDEX IF NOT EXISTS idx_users_work_experience ON users USING GIN(work_experience) WHERE work_experience IS NOT NULL AND jsonb_array_length(work_experience) > 0;
CREATE INDEX IF NOT EXISTS idx_users_education ON users USING GIN(education) WHERE education IS NOT NULL AND jsonb_array_length(education) > 0;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at on users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON COLUMN users.phone IS 'Student phone number for contact';
COMMENT ON COLUMN users.linkedin_url IS 'LinkedIn profile URL';
COMMENT ON COLUMN users.github_url IS 'GitHub profile URL';
COMMENT ON COLUMN users.website_url IS 'Personal website or portfolio URL';
COMMENT ON COLUMN users.address IS 'Physical address';
COMMENT ON COLUMN users.preferred_industry IS 'Preferred industry for career (e.g., Software, Finance, Healthcare)';
COMMENT ON COLUMN users.degree_type IS 'Type of degree: bachelor, master, phd, associate, certificate';
COMMENT ON COLUMN users.work_experience IS 'JSONB array of work experience entries';
COMMENT ON COLUMN users.education IS 'JSONB array of education history entries';
COMMENT ON COLUMN users.updated_at IS 'Timestamp of last profile update';

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- After running this migration, the users table will have enhanced fields
-- for student profiles including contact details, work experience, and education
-- ============================================================================

