# 🔧 Setup Event Notification Recipients

## 🎯 **Goal**

Ensure that when you create an event, emails are automatically sent to:
- **prasanna.salunkhe@tamu.edu** (sponsor)
- **nisarg.sonar@tamu.edu** (mentor)

---

## ✅ **What I've Done**

1. **Updated Event Trigger** (`lib/email/event-trigger.ts`)
   - Now specifically targets **sponsors and mentors** when events are created
   - Changed from "all users" to "sponsors and mentors only"

2. **Created Setup Script** (`scripts/setup-event-notification-users.sql`)
   - Ensures these users exist with correct roles
   - Enables email notifications for them

---

## 🚀 **Setup Steps**

### **Step 1: Run SQL Setup Script**

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Click **SQL Editor** → **New Query**

2. **Run the Setup Script**
   - Open file: `scripts/setup-event-notification-users.sql`
   - Copy **ALL** contents
   - Paste into SQL Editor
   - Click **Run**

3. **Verify Setup**
   - The script will output a verification query
   - You should see both users with:
     - Correct roles (sponsor, mentor)
     - `email_enabled = true`

### **Step 2: Verify Users Exist in Auth**

These users need to exist in `auth.users` table. If they don't:

**Option A: They sign up via the app**
- They can sign up at `/signup`
- The SQL script will update their roles automatically

**Option B: Create them manually in Supabase**
1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email and set password
4. The SQL script will handle the rest

### **Step 3: Test Event Creation**

1. **Log in as Admin**
   - Go to `/admin/events/new`

2. **Create a Test Event**
   - Fill in event details
   - Click **Save**

3. **Check Email Queue**
   - Go to Supabase → `communication_queue` table
   - Should see 2 emails queued (one for each user)

4. **Process Queue** (wait 5 min or trigger manually)
   - Emails will be sent automatically

5. **Verify Emails Sent**
   - Check `communication_logs` table
   - Check Resend dashboard
   - Check their email inboxes

---

## 🔍 **Verification Queries**

Run these in Supabase SQL Editor to verify:

### **Check Users Exist**
```sql
SELECT email, role, full_name 
FROM users 
WHERE email IN ('prasanna.salunkhe@tamu.edu', 'nisarg.sonar@tamu.edu');
```

### **Check Email Preferences**
```sql
SELECT 
  u.email,
  u.role,
  cp.email_enabled
FROM users u
LEFT JOIN communication_preferences cp ON u.id = cp.user_id
WHERE u.email IN ('prasanna.salunkhe@tamu.edu', 'nisarg.sonar@tamu.edu');
```

### **Check Queued Emails (After Creating Event)**
```sql
SELECT 
  cq.id,
  u.email,
  u.role,
  cq.status,
  cq.scheduled_for,
  cq.metadata->>'event_title' as event_title
FROM communication_queue cq
JOIN users u ON cq.recipient_id = u.id
WHERE u.email IN ('prasanna.salunkhe@tamu.edu', 'nisarg.sonar@tamu.edu')
ORDER BY cq.created_at DESC
LIMIT 10;
```

---

## 📝 **How It Works Now**

1. **Admin creates event** → `events.create` mutation
2. **Event is saved** → Database
3. **Trigger fires** → `onEventCreated()` function
4. **System finds sponsors & mentors** → `getUsersByRole(['sponsor', 'mentor'])`
5. **Emails are queued** → `communication_queue` table
6. **Queue processor sends** → Every 5 minutes (or manually)
7. **Emails delivered** → prasanna.salunkhe@tamu.edu & nisarg.sonar@tamu.edu

---

## 🎯 **Expected Behavior**

When you create an event:
- ✅ **Only sponsors and mentors** receive notification emails
- ✅ **prasanna.salunkhe@tamu.edu** (sponsor) gets email
- ✅ **nisarg.sonar@tamu.edu** (mentor) gets email
- ✅ Other users (students, etc.) do **NOT** get emails on event creation
- ✅ Emails are queued with randomized send times
- ✅ Emails are sent within 5 minutes (or when queue processor runs)

---

## 🔧 **Troubleshooting**

### **Users Not Receiving Emails?**

1. **Check users exist:**
   ```sql
   SELECT * FROM users WHERE email IN ('prasanna.salunkhe@tamu.edu', 'nisarg.sonar@tamu.edu');
   ```

2. **Check roles are correct:**
   - prasanna.salunkhe@tamu.edu should have `role = 'sponsor'`
   - nisarg.sonar@tamu.edu should have `role = 'mentor'`

3. **Check email preferences:**
   ```sql
   SELECT * FROM communication_preferences 
   WHERE user_id IN (
     SELECT id FROM users 
     WHERE email IN ('prasanna.salunkhe@tamu.edu', 'nisarg.sonar@tamu.edu')
   );
   ```
   - Should show `email_enabled = true`

4. **Check queue after creating event:**
   ```sql
   SELECT * FROM communication_queue 
   WHERE recipient_id IN (
     SELECT id FROM users 
     WHERE email IN ('prasanna.salunkhe@tamu.edu', 'nisarg.sonar@tamu.edu')
   )
   ORDER BY created_at DESC;
   ```

### **No Emails in Queue?**

- Check server logs for errors
- Verify `onEventCreated` is being called
- Check Supabase connection
- Verify event was created successfully

---

## ✅ **Success Checklist**

- [ ] SQL setup script run successfully
- [ ] Both users exist in `users` table
- [ ] Both users have correct roles (sponsor, mentor)
- [ ] Both users have `email_enabled = true` in preferences
- [ ] Created test event as admin
- [ ] Checked `communication_queue` - 2 emails queued
- [ ] Queue processor ran (or triggered manually)
- [ ] Checked `communication_logs` - emails sent
- [ ] Both users received emails in their inbox

---

**Once setup is complete, every time you create an event, these two users will automatically receive notification emails!** 🎉


