-- ============================================================================
-- Add Contact Information Fields to Mentorship Profiles
-- ============================================================================
-- Adds phone, LinkedIn, and other contact details for mentors
-- Run this after the main mentorship system migration
-- ============================================================================

-- Add contact information columns to mentorship_profiles
ALTER TABLE mentorship_profiles
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS website_url text,
ADD COLUMN IF NOT EXISTS preferred_name text, -- Display name (if different from full_name)
ADD COLUMN IF NOT EXISTS contact_email text;  -- Optional: if different from user email

-- Add comments for documentation
COMMENT ON COLUMN mentorship_profiles.phone_number IS 'Phone number for contact (optional)';
COMMENT ON COLUMN mentorship_profiles.linkedin_url IS 'LinkedIn profile URL (optional)';
COMMENT ON COLUMN mentorship_profiles.website_url IS 'Personal or professional website URL (optional)';
COMMENT ON COLUMN mentorship_profiles.preferred_name IS 'Preferred display name (if different from users.full_name)';
COMMENT ON COLUMN mentorship_profiles.contact_email IS 'Contact email if different from users.email (optional)';

-- Create index for LinkedIn searches
CREATE INDEX IF NOT EXISTS idx_mentorship_profiles_linkedin ON mentorship_profiles(linkedin_url) WHERE linkedin_url IS NOT NULL;
