-- Helper DB functions for CMIS Event Management
-- Run this in Supabase SQL Editor after enabling pgcrypto:
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Upsert user by email and return id
CREATE OR REPLACE FUNCTION register_user(p_email text, p_full_name text)
RETURNS uuid AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO users (email, full_name)
    VALUES (lower(p_email), p_full_name)
  ON CONFLICT (email) DO UPDATE
    SET full_name = EXCLUDED.full_name
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;


-- 2) Register for event or add to waitlist. Returns JSON status.
CREATE OR REPLACE FUNCTION register_for_event(p_event_id uuid, p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_capacity integer;
  v_registered_count integer;
  v_reg_id uuid;
  v_wait_id uuid;
  v_position integer;
BEGIN
  SELECT capacity INTO v_capacity FROM events WHERE id = p_event_id;
  IF v_capacity IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'event_not_found');
  END IF;

  SELECT count(*) INTO v_registered_count
    FROM event_registrations
   WHERE event_id = p_event_id AND status = 'registered';

  IF v_registered_count < v_capacity THEN
    INSERT INTO event_registrations (event_id, user_id, status)
    VALUES (p_event_id, p_user_id, 'registered')
    RETURNING id INTO v_reg_id;

    RETURN jsonb_build_object('ok', true, 'status', 'registered', 'registration_id', v_reg_id);
  ELSE
    SELECT COALESCE(MAX(position),0) + 1 INTO v_position FROM waitlist WHERE event_id = p_event_id;

    INSERT INTO waitlist (event_id, user_id, position)
    VALUES (p_event_id, p_user_id, v_position)
    RETURNING id INTO v_wait_id;

    RETURN jsonb_build_object('ok', true, 'status', 'waitlisted', 'waitlist_id', v_wait_id, 'position', v_position);
  END IF;
END;
$$ LANGUAGE plpgsql;


-- 3) Promote first waitlist entry to registration (call after a cancellation)
CREATE OR REPLACE FUNCTION promote_waitlist(p_event_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_capacity integer;
  v_registered_count integer;
  v_wid uuid;
  v_wuser uuid;
  v_wpos integer;
  v_reg_id uuid;
BEGIN
  SELECT capacity INTO v_capacity FROM events WHERE id = p_event_id;
  IF v_capacity IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'event_not_found');
  END IF;

  SELECT count(*) INTO v_registered_count
    FROM event_registrations
   WHERE event_id = p_event_id AND status = 'registered';

  IF v_registered_count >= v_capacity THEN
    RETURN jsonb_build_object('ok', false, 'status', 'full');
  END IF;

  SELECT id, user_id, position INTO v_wid, v_wuser, v_wpos
    FROM waitlist
   WHERE event_id = p_event_id
   ORDER BY position
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', true, 'status', 'no_waitlist');
  END IF;

  -- create registration
  INSERT INTO event_registrations (event_id, user_id, status)
    VALUES (p_event_id, v_wuser, 'registered')
    RETURNING id INTO v_reg_id;

  -- remove from waitlist and shift positions
  DELETE FROM waitlist WHERE id = v_wid;
  UPDATE waitlist
     SET position = position - 1
   WHERE event_id = p_event_id AND position > v_wpos;

  RETURN jsonb_build_object('ok', true, 'promoted_registration_id', v_reg_id, 'user_id', v_wuser);
END;
$$ LANGUAGE plpgsql;


-- 4) Simple analytics helper
CREATE OR REPLACE FUNCTION get_event_stats(p_event_id uuid)
RETURNS jsonb AS $$
BEGIN
  RETURN jsonb_build_object(
    'event_id', p_event_id,
    'capacity', (SELECT capacity FROM events WHERE id = p_event_id),
    'registered', (SELECT count(*) FROM event_registrations WHERE event_id = p_event_id AND status = 'registered'),
    'waitlist', (SELECT count(*) FROM waitlist WHERE event_id = p_event_id)
  );
END;
$$ LANGUAGE plpgsql;