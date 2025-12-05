-- Fix existing templates that have type='email' to have the correct type
-- This script updates templates to match their target_audience or name

-- Fix event_notification templates
UPDATE communication_templates
SET type = 'event_notification'
WHERE type = 'email' 
  AND (target_audience = 'event_notification' OR name LIKE '%event_notification%' OR name LIKE '%event%notification%');

-- Fix reminder templates  
UPDATE communication_templates
SET type = 'reminder'
WHERE type = 'email'
  AND (target_audience = 'reminder' OR name LIKE '%reminder%');

-- Fix sponsor_digest templates
UPDATE communication_templates
SET type = 'sponsor_digest'
WHERE type = 'email'
  AND (target_audience = 'sponsor_digest' OR name LIKE '%sponsor%digest%');

-- Show what was updated
SELECT id, name, type, target_audience, channel
FROM communication_templates
WHERE type != 'email'
ORDER BY created_at DESC;


