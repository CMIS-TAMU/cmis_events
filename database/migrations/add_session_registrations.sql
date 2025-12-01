-- Migration: Add session registrations table
-- Run this in Supabase SQL Editor

-- Session registrations table
CREATE TABLE IF NOT EXISTS session_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES event_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  registered_at timestamptz DEFAULT now(),
  UNIQUE (session_id, user_id)
);

-- Create indexes
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

