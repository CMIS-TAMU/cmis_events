-- Master Migration Script for CMIS Event Management System
-- Run this entire script in Supabase SQL Editor
-- This combines all migrations in the correct order

-- ============================================================================
-- 1. QR CODE MIGRATION
-- ============================================================================
-- Add QR code support to event_registrations
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS qr_code_token text;

ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS checked_in_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_event_registrations_qr_code_token 
ON event_registrations(qr_code_token);

CREATE INDEX IF NOT EXISTS idx_event_registrations_status 
ON event_registrations(status);

-- ============================================================================
-- 2. RESUME FIELDS MIGRATION
-- ============================================================================
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

-- ============================================================================
-- 3. SESSION REGISTRATIONS MIGRATION
-- ============================================================================
-- Session registrations table
CREATE TABLE IF NOT EXISTS session_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES event_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  registered_at timestamptz DEFAULT now(),
  UNIQUE (session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_session_registrations_session_id ON session_registrations(session_id);
CREATE INDEX IF NOT EXISTS idx_session_registrations_user_id ON session_registrations(user_id);

-- Function to check session capacity
CREATE OR REPLACE FUNCTION check_session_capacity(p_session_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_capacity integer;
  v_registered_count integer;
BEGIN
  SELECT capacity INTO v_capacity FROM event_sessions WHERE id = p_session_id;
  IF v_capacity IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'session_not_found');
  END IF;

  IF v_capacity = 0 THEN
    RETURN jsonb_build_object('ok', true, 'available', true, 'remaining', -1);
  END IF;

  SELECT count(*) INTO v_registered_count
    FROM session_registrations
   WHERE session_id = p_session_id;

  RETURN jsonb_build_object(
    'ok', true,
    'available', v_registered_count < v_capacity,
    'registered', v_registered_count,
    'capacity', v_capacity,
    'remaining', GREATEST(0, v_capacity - v_registered_count)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to register for session
CREATE OR REPLACE FUNCTION register_for_session(p_session_id uuid, p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_capacity_info jsonb;
  v_reg_id uuid;
BEGIN
  -- Check capacity
  v_capacity_info := check_session_capacity(p_session_id);
  
  IF NOT (v_capacity_info->>'ok')::boolean THEN
    RETURN v_capacity_info;
  END IF;

  IF NOT (v_capacity_info->>'available')::boolean THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'session_full',
      'registered', (v_capacity_info->>'registered')::integer,
      'capacity', (v_capacity_info->>'capacity')::integer
    );
  END IF;

  -- Register user
  INSERT INTO session_registrations (session_id, user_id)
  VALUES (p_session_id, p_user_id)
  RETURNING id INTO v_reg_id;

  RETURN jsonb_build_object('ok', true, 'registration_id', v_reg_id);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICATION QUERIES (Optional - run to verify migration)
-- ============================================================================

-- Check QR code columns exist
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'event_registrations' 
-- AND column_name IN ('qr_code_token', 'checked_in_at');

-- Check resume columns exist
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
-- AND column_name IN ('resume_url', 'resume_filename', 'major', 'gpa', 'skills');

-- Check session_registrations table exists
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_name = 'session_registrations';

-- Check functions exist
-- SELECT routine_name 
-- FROM information_schema.routines 
-- WHERE routine_name IN ('check_session_capacity', 'register_for_session');

