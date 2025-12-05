# 🔍 Debug: Email Trigger Not Working

## ❌ **Problem**
Event created but no emails queued, no logs showing.

---

## ✅ **Step-by-Step Debugging**

### **Step 1: Check Server Logs**

When you create an event, you should see these logs in order:

```
🔍 Event created, data: { id: '...', title: '...' }
📧 Triggering email notifications for event: [event-id]
📧 [1/4] Starting email trigger process...
📧 [2/4] onEventCreated imported, calling with eventId: [event-id]
🚀 onEventCreated called with eventId: [event-id]
📋 Fetching event details...
✅ Event found: [event-title]
📧 Getting/creating email template...
✅ Template ID: [template-id]
Finding sponsors and mentors...
Found sponsors/mentors: X [...]
📬 Queueing X emails...
  Queueing email 1/X for recipient: [id], scheduled: [time]
[queueEmail] Queueing email for recipient: [id], template: [template-id]
[queueEmail] ✅ Successfully queued email with queueId: [id]
  ✅ Email 1 queued successfully (queueId: [id])
...
📧 [3/4] onEventCreated completed, result: { success: true, queued: X, sent: X, failed: 0 }
✅ [4/4] Emails sent successfully!
```

**If you don't see ANY of these logs:**
- The trigger isn't being called
- Check if you're creating a NEW event (not updating)
- Check server console for any errors

---

### **Step 2: Test with Manual Trigger**

Use the test endpoint to manually trigger emails:

**Get an event ID:**
1. Go to `/admin/events`
2. Copy an event ID from the URL or list

**Trigger emails manually:**
```bash
# Replace [EVENT-ID] with actual event ID
curl -X POST "http://localhost:3000/api/test-event-email-trigger?eventId=[EVENT-ID]"
```

**Or use browser/Postman:**
- URL: `http://localhost:3000/api/test-event-email-trigger?eventId=[EVENT-ID]`
- Method: `POST`

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully queued 4 emails, sent 4",
  "details": {
    "notificationsQueued": 4,
    "notificationsSent": 4,
    "notificationsFailed": 0,
    "error": null
  }
}
```

---

### **Step 3: Check Database**

**Check if emails were queued:**
```sql
SELECT * FROM communication_queue
ORDER BY created_at DESC
LIMIT 10;
```

**Check if template exists:**
```sql
SELECT id, name, type, target_audience
FROM communication_templates
WHERE name LIKE '%event%notification%';
```

**Expected:**
- `type` = `'email'` (communication channel)
- `target_audience` = `'event_notification'` (template category)

**If target_audience is NULL or wrong:**
```sql
UPDATE communication_templates
SET target_audience = 'event_notification'
WHERE name LIKE '%event%notification%' 
  AND (target_audience IS NULL OR target_audience != 'event_notification');
```

---

### **Step 4: Check Environment Variables**

Make sure these are set in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
```

**Test if service role key works:**
```sql
-- Run in Supabase SQL Editor
-- Should work without RLS errors
SELECT * FROM events LIMIT 1;
```

---

### **Step 5: Verify Users Exist**

**Check if sponsors/mentors exist:**
```sql
SELECT u.id, u.email, u.role, cp.email_enabled
FROM users u
LEFT JOIN communication_preferences cp ON cp.user_id = u.id
WHERE u.role IN ('sponsor', 'mentor')
ORDER BY u.role, u.email;
```

**Expected:**
- At least 2 users with roles 'sponsor' or 'mentor'
- `email_enabled` should be `true` (or NULL, which defaults to true)

**If users don't have preferences:**
```sql
-- This should auto-create, but you can manually create:
INSERT INTO communication_preferences (user_id, email_enabled)
SELECT id, true
FROM users
WHERE role IN ('sponsor', 'mentor')
ON CONFLICT (user_id) DO UPDATE SET email_enabled = true;
```

---

## 🐛 **Common Issues**

### **Issue 1: No Logs at All**
**Cause:** Trigger code not executing
**Fix:** 
- Restart server
- Check if you're creating (not updating) event
- Check server console for errors

### **Issue 2: "Event not found" Error**
**Cause:** RLS blocking access or wrong event ID
**Fix:**
- Verify event exists: `SELECT * FROM events WHERE id = '[event-id]';`
- Check service role key is set correctly

### **Issue 3: "No eligible recipients found"**
**Cause:** No users with sponsor/mentor roles
**Fix:**
- Run setup script: `scripts/setup-event-notification-users.sql`
- Or manually create users with correct roles

### **Issue 4: "Unknown template category" Error**
**Cause:** Template has wrong `target_audience`
**Fix:**
```sql
UPDATE communication_templates
SET target_audience = 'event_notification'
WHERE name LIKE '%event%notification%';
```

### **Issue 5: Emails Queued but Not Sent**
**Cause:** Queue processor not running
**Fix:**
- Check queue: `SELECT * FROM communication_queue WHERE status = 'pending';`
- Manually trigger: `POST /api/cron/process-queue`
- Or wait for cron job (runs every minute)

---

## 🧪 **Quick Test**

1. **Create a test event** via UI
2. **Watch server logs** - should see all the logs above
3. **Check database:**
   ```sql
   SELECT COUNT(*) FROM communication_queue WHERE status = 'pending';
   ```
4. **If count > 0:** Emails are queued, check processor
5. **If count = 0:** Trigger didn't run, check logs

---

## 📞 **Next Steps**

1. **Check server logs** when creating event
2. **Use test endpoint** to manually trigger
3. **Check database** for queued emails
4. **Share the logs** you see (or don't see)

---

**The code is correct - we just need to find where it's failing!** 🔍


