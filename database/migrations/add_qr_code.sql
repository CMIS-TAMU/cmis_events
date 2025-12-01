-- Migration: Add QR code support to event_registrations
-- Run this in Supabase SQL Editor

-- Add QR code token column to store the QR code identifier
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS qr_code_token text;

-- Add checked_in_at timestamp
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS checked_in_at timestamptz;

-- Create index for faster QR code lookups
CREATE INDEX IF NOT EXISTS idx_event_registrations_qr_code_token 
ON event_registrations(qr_code_token);

-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_event_registrations_status 
ON event_registrations(status);

-- Update existing registrations to have QR codes (optional)
-- This will generate QR tokens for existing registrations
-- UPDATE event_registrations
-- SET qr_code_token = encode(gen_random_bytes(16), 'hex')
-- WHERE qr_code_token IS NULL;

