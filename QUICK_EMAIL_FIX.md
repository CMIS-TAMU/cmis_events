# ⚡ Quick Fix: Emails Not Sending After Event Creation

## 🎯 **The Problem**

Event is created successfully, but emails aren't sent to sponsors/mentors.

## ✅ **What I Fixed**

1. **Improved Error Logging**
   - Email trigger now logs detailed information
   - Shows how many sponsors/mentors were found
   - Shows if emails were queued

2. **Auto-Create Email Preferences**
   - If users don't have preferences, they're created automatically
   - Email is enabled by default for sponsors/mentors

3. **Better Debugging**
   - Created debug endpoint: `/api/debug/email-queue`
   - Shows queue status, users, preferences

---

## 🚀 **Quick Fix Steps**

### **Step 1: Ensure Users Exist**

Run this in Supabase SQL Editor:

```sql
-- Create/update users with correct roles
INSERT INTO users (email, full_name, role)
VALUES 
  ('prasanna.salunkhe@tamu.edu', 'Prasanna Salunkhe', 'sponsor'),
  ('nisarg.sonar@tamu.edu', 'Nisarg Sonar', 'mentor')
ON CONFLICT (email) 
DO UPDATE SET 
  role = EXCLUDED.role,
  full_name = COALESCE(EXCLUDED.full_name, users.full_name);

-- Enable email preferences (auto-created if needed)
INSERT INTO communication_preferences (user_id, email_enabled)
SELECT id, true FROM users
WHERE email IN ('prasanna.salunkhe@tamu.edu', 'nisarg.sonar@tamu.edu')
ON CONFLICT (user_id) 
DO UPDATE SET email_enabled = true;
```

### **Step 2: Restart Server**

```bash
# Stop server (Ctrl+C)
npm run dev
```

### **Step 3: Create Test Event**

1. Go to `/admin/events/new`
2. Create an event
3. **Check server logs** - Should see:
   ```
   Finding sponsors and mentors...
   Found sponsors/mentors: 2 [ { email: '...', role: 'sponsor' }, ... ]
   Email trigger result: { success: true, notificationsQueued: 2 }
   ```

### **Step 4: Check Queue**

Visit: `http://localhost:3000/api/debug/email-queue`

Should show:
- `sponsors_mentors.count: 2`
- `preferences.count: 2`
- `queue.count: 2` (or more)

### **Step 5: Process Queue**

**Option A: Wait 5 minutes** (automatic)

**Option B: Manual trigger**
```bash
# In browser console:
fetch('/api/cron/process-queue', {
  headers: { 'Authorization': 'Bearer YOUR_CRON_SECRET' }
})
.then(r => r.json())
.then(console.log);
```

---

## 🔍 **Debug Checklist**

After creating an event, check:

1. **Server Logs:**
   - Look for "Email trigger result"
   - Check for errors

2. **Debug Endpoint:**
   - Visit `/api/debug/email-queue`
   - Check all counts

3. **Database:**
   ```sql
   -- Check queue
   SELECT COUNT(*) FROM communication_queue WHERE status = 'pending';
   
   -- Check users
   SELECT email, role FROM users WHERE role IN ('sponsor', 'mentor');
   
   -- Check preferences
   SELECT u.email, cp.email_enabled 
   FROM communication_preferences cp
   JOIN users u ON cp.user_id = u.id
   WHERE u.role IN ('sponsor', 'mentor');
   ```

---

## 🎯 **Expected Flow**

1. ✅ Event created
2. ✅ Email trigger called (check server logs)
3. ✅ Sponsors/mentors found (check logs)
4. ✅ Emails queued (check `communication_queue`)
5. ✅ Queue processor sends (check `communication_logs`)
6. ✅ Emails delivered (check Resend dashboard)

---

## 🐛 **If Still Not Working**

### **No Users Found:**
- Run the SQL script above
- Verify users exist with correct roles

### **Emails Queued But Not Sent:**
- Check Resend API key
- Manually trigger queue processor
- Check Resend dashboard for errors

### **No Queue Items:**
- Check server logs for email trigger errors
- Verify `onEventCreated` is being called
- Check if there are import/module errors

---

**The fix is in place - restart server and try creating an event again!**

Check server logs to see what's happening with the email trigger.


