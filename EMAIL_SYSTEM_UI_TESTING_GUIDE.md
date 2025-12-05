# 🧪 Email Notification System - UI Testing Guide

## ✅ **Build Status: PASSED**

The build completed successfully! All API routes are properly configured as dynamic routes.

---

## 🎯 **Testing Overview**

This guide will walk you through testing the email notification system via the UI and database.

---

## 📋 **Prerequisites**

Before testing, ensure:
- ✅ Database migration is run (`add_communication_system.sql`)
- ✅ Environment variables are set (Resend API key, etc.)
- ✅ You have test user accounts (admin, student, sponsor)
- ✅ Dev server is running: `npm run dev`

---

## 🧪 **Test 1: Event Creation → Automatic Notifications**

### **Steps:**

1. **Log in as Admin**
   - Go to `http://localhost:3000/login`
   - Sign in with admin account

2. **Create a New Event**
   - Navigate to `/admin/events/new`
   - Fill in event details:
     - Title: "Test Email Notification Event"
     - Description: "Testing automatic email notifications"
     - Date: Set to tomorrow or future date
     - Time: Any time
     - Capacity: 50
   - Click **Save** or **Create Event**

3. **Check Email Queue (Database)**
   - Go to Supabase Dashboard → Table Editor
   - Open `communication_queue` table
   - You should see queued emails for eligible users
   - Check:
     - `status` = "pending"
     - `template_id` is set
     - `scheduled_for` has a future timestamp
     - `metadata` contains event information

4. **Verify Queue Processing**
   - Wait 5 minutes (or manually trigger - see Test 2)
   - Check `communication_logs` table
   - Should see entries with `status` = "sent"
   - Check Resend dashboard for sent emails

### **Expected Results:**
- ✅ Event is created successfully
- ✅ Emails are queued in `communication_queue`
- ✅ Emails are sent within 5 minutes (or when queue processor runs)
- ✅ Logs appear in `communication_logs`

---

## 🧪 **Test 2: Manual Queue Processing**

### **Steps:**

1. **Get Your CRON_SECRET**
   - Check `.env.local` for `CRON_SECRET` value

2. **Trigger Queue Processor**
   - Open browser or use curl/Postman
   - Make GET request to:
     ```
     http://localhost:3000/api/cron/process-queue
     ```
   - Add header:
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```

3. **Check Response**
   - Should return JSON with:
     ```json
     {
       "success": true,
       "processed": 5,
       "sent": 5,
       "failed": 0,
       "errors": [],
       "timestamp": "..."
     }
     ```

4. **Verify in Database**
   - Check `communication_queue` - processed items should be "sent"
   - Check `communication_logs` - should have new entries
   - Check Resend dashboard - emails should be sent

### **Expected Results:**
- ✅ API returns success response
- ✅ Queue items are processed
- ✅ Emails are sent via Resend
- ✅ Logs are created

---

## 🧪 **Test 3: 24-Hour Reminder System**

### **Steps:**

1. **Create Event for Tomorrow**
   - As admin, create event with start time = tomorrow (24 hours from now)
   - Save the event

2. **Register a User**
   - Log out, log in as a student/sponsor
   - Go to the event page
   - Click **Register**

3. **Trigger Reminder Cron Job**
   - Make GET request to:
     ```
     http://localhost:3000/api/cron/send-reminders
     ```
   - With header: `Authorization: Bearer YOUR_CRON_SECRET`

4. **Check Queue**
   - Check `communication_queue` table
   - Should see reminder emails queued for registered users
   - `metadata` should contain `reminder_type: "24h"`

5. **Process Queue**
   - Trigger queue processor (Test 2)
   - Reminders should be sent

### **Expected Results:**
- ✅ Reminders are queued for registered users
- ✅ Only users registered for tomorrow's events get reminders
- ✅ No duplicate reminders (system checks before sending)
- ✅ Emails are sent successfully

---

## 🧪 **Test 4: Weekly Sponsor Digest**

### **Steps:**

1. **Ensure You Have Sponsors**
   - Create sponsor accounts or use existing ones
   - Ensure they have `role = 'sponsor'` in database

2. **Create Some Events**
   - Create 2-3 events in the next 30 days
   - Register some students to these events

3. **Trigger Sponsor Digest**
   - Make GET request to:
     ```
     http://localhost:3000/api/cron/sponsor-digest
     ```
   - With header: `Authorization: Bearer YOUR_CRON_SECRET`

4. **Check Response**
   - Should return:
     ```json
     {
       "success": true,
       "sponsorsFound": 3,
       "eventsFound": 2,
       "newStudentsFound": 5,
       "digestsQueued": 3,
       ...
     }
     ```

5. **Check Queue**
   - `communication_queue` should have digest emails
   - `metadata` should contain events, new students, top resumes

6. **Process Queue**
   - Trigger queue processor
   - Sponsors should receive digest emails

### **Expected Results:**
- ✅ All sponsors receive digest emails
- ✅ Digest includes upcoming events
- ✅ Digest includes new students (if any)
- ✅ Emails are sent successfully

---

## 🧪 **Test 5: Email Preferences Management**

### **Steps:**

1. **Get User Preferences**
   - Log in as any user
   - Make GET request to:
     ```
     http://localhost:3000/api/preferences
     ```
   - Should return current preferences

2. **Update Preferences**
   - Make POST request to:
     ```
     http://localhost:3000/api/preferences
     ```
   - Body:
     ```json
     {
       "email_enabled": false,
       "unsubscribe_categories": ["reminders"]
     }
     ```

3. **Verify in Database**
   - Check `communication_preferences` table
   - User's preferences should be updated

4. **Test Email Blocking**
   - Create a new event (as admin)
   - User with `email_enabled: false` should NOT receive emails
   - Check `communication_queue` - should not have entries for that user

### **Expected Results:**
- ✅ Preferences can be retrieved
- ✅ Preferences can be updated
- ✅ Disabled users don't receive emails
- ✅ Category unsubscribes work

---

## 🧪 **Test 6: Unsubscribe System**

### **Steps:**

1. **Generate Unsubscribe Token**
   - For testing, create a simple token:
   - User ID + timestamp, base64 encoded
   - Example: `Buffer.from('user-id-123-1234567890').toString('base64')`

2. **Test Unsubscribe Link**
   - Open in browser:
     ```
     http://localhost:3000/api/unsubscribe?token=YOUR_TOKEN&category=all
     ```
   - Should show success page

3. **Verify Unsubscribe**
   - Check `communication_preferences` table
   - User's `email_enabled` should be `false`
   - Or `unsubscribe_categories` should contain the category

4. **Test Category-Specific Unsubscribe**
   - Use: `?token=TOKEN&category=reminders`
   - Only reminder emails should be blocked

### **Expected Results:**
- ✅ Unsubscribe page displays correctly
- ✅ Preferences are updated in database
- ✅ User stops receiving emails (or specific categories)

---

## 🧪 **Test 7: Email Analytics**

### **Steps:**

1. **Send Some Emails First**
   - Complete Tests 1-4 to generate email activity

2. **Get Analytics**
   - Make GET request to:
     ```
     http://localhost:3000/api/analytics/emails?days=30
     ```
   - Should return JSON with statistics

3. **Check Response**
   - Should include:
     - Queue statistics (pending, sent, failed)
     - Performance metrics (delivery rate, total sent)
     - Statistics by email type
     - Unsubscribe statistics

### **Expected Results:**
- ✅ Analytics API returns data
- ✅ Statistics are accurate
- ✅ Can filter by time period

---

## 🧪 **Test 8: Template Variations**

### **Steps:**

1. **Send Multiple Emails**
   - Create several events
   - Queue multiple emails

2. **Check Template Variations**
   - In `communication_logs` table
   - Check `metadata.variation_index`
   - Should see different variation indices (0-4)

3. **Verify Random Selection**
   - Multiple emails should use different variations
   - Each email type has 5 variations

### **Expected Results:**
- ✅ Different template variations are used
- ✅ Random selection works
- ✅ All 5 variations are used over time

---

## 📊 **Database Verification Checklist**

After running tests, verify in Supabase:

### **communication_queue**
- [ ] Emails are queued with correct `template_id`
- [ ] `scheduled_for` times are randomized
- [ ] `status` changes from "pending" → "processing" → "sent"
- [ ] `metadata` contains correct event/user information

### **communication_logs**
- [ ] Logs are created for each sent email
- [ ] `status` = "sent" for successful sends
- [ ] `metadata` contains variation index
- [ ] `sent_at` timestamp is recorded

### **communication_preferences**
- [ ] User preferences are created/updated
- [ ] `email_enabled` flag works correctly
- [ ] `unsubscribe_categories` array works

### **communication_templates**
- [ ] Templates are auto-created when needed
- [ ] Templates have correct `type` and `name`

---

## 🔍 **Troubleshooting**

### **No Emails in Queue After Event Creation**
- Check browser console for errors
- Check server logs for errors
- Verify `onEventCreated` is being called
- Check Supabase connection

### **Emails Not Sending**
- Verify `RESEND_API_KEY` is set
- Check Resend dashboard for errors
- Verify `RESEND_FROM_EMAIL` is correct
- Check queue processor is running

### **Cron Jobs Not Working**
- Verify `CRON_SECRET` is set
- Check authorization header is correct
- Verify routes are accessible
- Check Vercel cron configuration (if deployed)

### **Database Errors**
- Verify migration was run
- Check RLS policies allow access
- Verify service role key is set
- Check table names match

---

## 🎯 **Quick Test Script**

For quick testing, you can use this script in browser console:

```javascript
// Test queue processor
fetch('/api/cron/process-queue', {
  headers: {
    'Authorization': 'Bearer YOUR_CRON_SECRET'
  }
})
.then(r => r.json())
.then(console.log);

// Test preferences
fetch('/api/preferences')
.then(r => r.json())
.then(console.log);

// Test analytics
fetch('/api/analytics/emails?days=7')
.then(r => r.json())
.then(console.log);
```

---

## ✅ **Success Criteria**

All tests pass if:
- ✅ Events trigger automatic email queuing
- ✅ Queue processor sends emails successfully
- ✅ Reminders are sent 24h before events
- ✅ Sponsor digest includes correct data
- ✅ Preferences can be managed
- ✅ Unsubscribe works correctly
- ✅ Analytics show accurate data
- ✅ Template variations are used randomly

---

## 📝 **Next Steps After Testing**

1. **Create UI Components** (optional):
   - Admin email dashboard
   - User preference management page
   - Email queue monitoring UI

2. **Add Email Tracking** (optional):
   - Open tracking pixels
   - Click tracking
   - Update analytics

3. **Deploy to Production**:
   - Deploy to Vercel
   - Configure cron jobs
   - Monitor email delivery

---

**Happy Testing!** 🚀


