# Event Email Notification Fix

## Issues Fixed

### 1. Missing `NEXT_PUBLIC_APP_URL` Fallback
**Problem:** The notification dispatcher was using `process.env.NEXT_PUBLIC_APP_URL` without a fallback, which could cause fetch requests to fail if the environment variable wasn't set.

**Fix:** Added fallback to `http://localhost:3000` in `lib/communications/notification-dispatcher.ts`

### 2. Better Error Handling
**Problem:** Email sending errors were being silently swallowed.

**Fix:** Added proper error checking for HTTP responses and better logging throughout the notification flow.

### 3. New Event Notifications Not Sending Immediately
**Problem:** `new_event` notifications were being queued based on sponsor tier preferences (basic tier = weekly, standard = batched), so emails weren't sent immediately.

**Fix:** Updated `shouldNotifyImmediately()` in `lib/communications/sponsor-tiers.ts` to always return `true` for `new_event` notifications, ensuring they're sent immediately regardless of sponsor tier.

### 4. Improved Logging
**Fix:** Added comprehensive logging to help diagnose issues:
- Logs when sponsors are found
- Logs when notifications are sent vs queued
- Logs success/failure for each sponsor
- Warns if no sponsors are found

## What to Check

### 1. Verify Sponsors Exist
Check if you have any sponsors in your database:
```sql
SELECT id, email, role, sponsor_tier FROM users WHERE role = 'sponsor';
```

If no sponsors exist, emails won't be sent. You need to create sponsor accounts.

### 2. Check Email Service Configuration
Verify that Brevo email service is configured:
- `BREVO_FROM_EMAIL` environment variable should be set
- `BREVO_FROM_NAME` environment variable (optional)
- `BREVO_API_KEY` or SMTP credentials should be configured

Check your `.env.local` or environment variables.

### 3. Check `NEXT_PUBLIC_APP_URL`
Make sure `NEXT_PUBLIC_APP_URL` is set correctly:
- For local development: `http://localhost:3000`
- For production: your actual domain URL

### 4. Check Server Logs
After creating an event, check your server console/logs for:
- `Found X sponsor(s) to notify about new_event`
- `Sending immediate notification to sponsor...`
- `✓ Notification sent to [email]` or `✗ Failed to send notification...`
- Any error messages

### 5. Check Notification Preferences
Even though `new_event` notifications now send immediately, check if sponsors have unsubscribed:
```sql
SELECT sponsor_id, unsubscribed_from FROM sponsor_preferences 
WHERE unsubscribed_from @> '["new_event"]'::jsonb;
```

## Testing

1. **Create a test sponsor account:**
   - Sign up a user
   - Update their role to 'sponsor' in the database:
     ```sql
     UPDATE users SET role = 'sponsor' WHERE email = 'your-test-email@example.com';
     ```

2. **Create a new event** as an admin

3. **Check the server logs** for notification messages

4. **Check the sponsor's email** (including spam folder)

5. **Verify email was sent** by checking:
   - Server logs show success
   - Email appears in Brevo dashboard (if using Brevo)
   - Email arrives in inbox

## Common Issues

### No Emails Sent
- **No sponsors in database:** Create sponsor accounts
- **Email service not configured:** Check Brevo configuration
- **Wrong `NEXT_PUBLIC_APP_URL`:** Update environment variable

### Emails Queued Instead of Sent
- This should no longer happen for `new_event` notifications after the fix
- If it still happens, check the logs to see why

### Emails Sent But Not Received
- Check spam folder
- Verify email address is correct
- Check Brevo dashboard for delivery status
- Verify domain is verified in Brevo (for production)

## Next Steps

1. Restart your development server to apply the changes
2. Create a test event and monitor the logs
3. Verify emails are being sent
4. If issues persist, check the logs for specific error messages

