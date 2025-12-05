# 🔍 Email System Debug Guide

## 🐛 **Problem: Event Created But No Emails Sent**

Event creation works, but emails aren't being sent to sponsors/mentors.

---

## 🔍 **Step 1: Check Debug Endpoint**

I've created a debug endpoint to check the email queue status.

**Visit in browser:**
```
http://localhost:3000/api/debug/email-queue
```

**This will show:**
- Recent queue items (pending emails)
- Recent logs (sent emails)
- Sponsors/mentors in database
- Email preferences status

**What to look for:**
- ✅ Are there queue items? (emails queued)
- ✅ Are there logs? (emails sent)
- ✅ Do sponsors/mentors exist?
- ✅ Are email preferences enabled?

---

## 🔍 **Step 2: Check Server Logs**

When you created the event, check your terminal for:

**Look for:**
```
Email trigger result: { success: true, notificationsQueued: 2 }
```

**Or errors like:**
```
Error triggering event notifications: ...
Email trigger failed: No eligible recipients found
```

---

## 🔍 **Step 3: Check Database Directly**

### **Check Queue:**
```sql
SELECT 
  cq.*,
  u.email,
  u.role,
  ct.name as template_name
FROM communication_queue cq
LEFT JOIN users u ON cq.recipient_id = u.id
LEFT JOIN communication_templates ct ON cq.template_id = ct.id
ORDER BY cq.created_at DESC
LIMIT 10;
```

### **Check Sponsors/Mentors:**
```sql
SELECT id, email, full_name, role
FROM users
WHERE role IN ('sponsor', 'mentor');
```

### **Check Email Preferences:**
```sql
SELECT 
  cp.*,
  u.email,
  u.role
FROM communication_preferences cp
JOIN users u ON cp.user_id = u.id
WHERE u.role IN ('sponsor', 'mentor');
```

---

## 🔧 **Common Issues & Fixes**

### **Issue 1: No Sponsors/Mentors Found**

**Symptom:** `Email trigger result: { success: true, notificationsQueued: 0, error: 'No eligible recipients found' }`

**Fix:**
1. Run the setup script: `scripts/setup-event-notification-users.sql`
2. Or manually create users:
   ```sql
   -- Create sponsor
   INSERT INTO users (email, full_name, role)
   VALUES ('prasanna.salunkhe@tamu.edu', 'Prasanna Salunkhe', 'sponsor')
   ON CONFLICT (email) DO UPDATE SET role = 'sponsor';
   
   -- Create mentor
   INSERT INTO users (email, full_name, role)
   VALUES ('nisarg.sonar@tamu.edu', 'Nisarg Sonar', 'mentor')
   ON CONFLICT (email) DO UPDATE SET role = 'mentor';
   
   -- Enable email preferences
   INSERT INTO communication_preferences (user_id, email_enabled)
   SELECT id, true FROM users
   WHERE email IN ('prasanna.salunkhe@tamu.edu', 'nisarg.sonar@tamu.edu')
   ON CONFLICT (user_id) DO UPDATE SET email_enabled = true;
   ```

### **Issue 2: Emails Queued But Not Sent**

**Symptom:** Queue has items with `status = 'pending'` but no logs

**Fix:**
1. **Manually trigger queue processor:**
   ```
   GET http://localhost:3000/api/cron/process-queue
   Header: Authorization: Bearer YOUR_CRON_SECRET
   ```

2. **Check Resend API key:**
   - Verify `RESEND_API_KEY` is set in `.env.local`
   - Check Resend dashboard for errors

### **Issue 3: Email Trigger Not Running**

**Symptom:** No "Email trigger result" in server logs

**Fix:**
- Check server logs for errors
- Verify `onEventCreated` is being called
- Check if there are import errors

---

## 🧪 **Quick Test**

### **Test 1: Check Users Exist**
```sql
SELECT email, role FROM users 
WHERE email IN ('prasanna.salunkhe@tamu.edu', 'nisarg.sonar@tamu.edu');
```

### **Test 2: Manually Trigger Email Queue**
Visit: `http://localhost:3000/api/debug/email-queue`

Check the response for:
- `sponsors_mentors.count` - Should be 2
- `preferences.count` - Should be 2
- `queue.count` - Should show queued emails

### **Test 3: Manually Process Queue**
```bash
# In browser console or Postman:
fetch('/api/cron/process-queue', {
  headers: {
    'Authorization': 'Bearer YOUR_CRON_SECRET'
  }
})
.then(r => r.json())
.then(console.log);
```

---

## 📋 **Checklist**

- [ ] Users exist with roles (sponsor, mentor)
- [ ] Email preferences enabled (`email_enabled = true`)
- [ ] Emails queued in `communication_queue`
- [ ] Queue processor running (or triggered manually)
- [ ] Resend API key configured
- [ ] Emails in `communication_logs` (sent)
- [ ] Check Resend dashboard for sent emails

---

## 🎯 **Next Steps**

1. **Check debug endpoint** - See what's happening
2. **Check server logs** - Look for email trigger errors
3. **Verify users exist** - Run SQL queries above
4. **Manually process queue** - If emails are queued but not sent
5. **Check Resend dashboard** - Verify emails were actually sent

---

**Start by visiting:** `http://localhost:3000/api/debug/email-queue` to see the current status!


