-- CORRECT FIX: Don't change type column (it must be 'email', 'sms', or 'social')
-- The type column is for communication channel, not template category
-- Template category is stored in target_audience column

-- Verify current state
SELECT id, name, type, target_audience, channel, subject
FROM communication_templates
ORDER BY created_at DESC;

-- The templates should have:
-- type = 'email' (communication channel - this is correct!)
-- target_audience = 'event_notification' (template category - this is what we use for processing)

-- If target_audience is NULL or wrong, fix it:
UPDATE communication_templates
SET target_audience = 'event_notification'
WHERE name LIKE '%event%notification%' 
  AND (target_audience IS NULL OR target_audience != 'event_notification');

-- Verify the fix
SELECT id, name, type, target_audience, channel
FROM communication_templates
ORDER BY created_at DESC;


